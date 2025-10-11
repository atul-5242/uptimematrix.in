import { prismaClient, IncidentStatus } from '@uptimematrix/store';
import { NextFunction, Request, Response } from 'express';

export const getIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.params;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const incidents = await prismaClient.incident.findMany({
      where: { organizationId },
      include: {
        website: {
          select: {
            name: true,
            url: true,
            monitorType: true,
          },
        },
        AcknowledgedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
        ResolvedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    res.status(200).json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    next(error);
  }
};

// Acknowledge an incident to stop escalations
export const acknowledgeIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user?.id;
    
    if (!incidentId) {
      return res.status(400).json({ error: 'Incident ID is required' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Find the incident and verify it belongs to the user's organization
    const incident = await prismaClient.incident.findFirst({
      where: {
        id: incidentId,
        organizationId: req.user.organizationId!,
        status: IncidentStatus.INVESTIGATING, // Only acknowledge investigating incidents
      },
      include: {
        website: {
          select: {
            name: true,
            url: true
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ 
        error: 'Incident not found or not in investigating status' 
      });
    }

    // Update the incident to acknowledged status
    const updatedIncident = await prismaClient.incident.update({
      where: { id: incidentId },
      data: {
        Acknowledged: true,
        AcknowledgedBy: { connect: { id: userId } },
        status: IncidentStatus.MONITORING, // Change status to monitoring
        nextEscalationTime: null, // Stop further escalations
      },
      include: {
        website: {
          select: {
            name: true,
            url: true
          }
        },
        AcknowledgedBy: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Incident ${incidentId} acknowledged by ${req.user.email} - escalations stopped`);

    res.status(200).json({
      message: 'Incident acknowledged successfully. Escalations have been stopped.',
      incident: updatedIncident
    });
  } catch (error) {
    console.error('Error acknowledging incident:', error);
    next(error);
  }
};

// Resolve an incident
export const resolveIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user?.id;
    const { resolutionNote } = req.body;
    
    if (!incidentId) {
      return res.status(400).json({ error: 'Incident ID is required' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Find the incident and verify it belongs to the user's organization
    const incident = await prismaClient.incident.findFirst({
      where: {
        id: incidentId,
        organizationId: req.user.organizationId!,
        status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
      },
      include: {
        website: {
          select: {
            name: true,
            url: true
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ 
        error: 'Incident not found or already resolved' 
      });
    }

    // Update the incident to resolved status
    const updatedIncident = await prismaClient.incident.update({
      where: { id: incidentId },
      data: {
        status: IncidentStatus.RESOLVED,
        endTime: new Date(),
        ResolvedBy: { connect: { id: userId } },
        nextEscalationTime: null, // Stop any remaining escalations
        Acknowledged: true, // Mark as acknowledged if not already
        AcknowledgedBy: incident.Acknowledged ? undefined : { connect: { id: userId } },
      },
      include: {
        website: {
          select: {
            name: true,
            url: true
          }
        },
        AcknowledgedBy: {
          select: {
            fullName: true,
            email: true
          }
        },
        ResolvedBy: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Incident ${incidentId} resolved by ${req.user.email}`);

    res.status(200).json({
      message: 'Incident resolved successfully.',
      incident: updatedIncident
    });
  } catch (error) {
    console.error('Error resolving incident:', error);
    next(error);
  }
};

// Get a specific incident by ID
export const getIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { incidentId } = req.params;
    
    if (!incidentId) {
      return res.status(400).json({ error: 'Incident ID is required' });
    }

    const incident = await prismaClient.incident.findFirst({
      where: {
        id: incidentId,
        organizationId: req.user.organizationId!,
      },
      include: {
        website: {
          select: {
            name: true,
            url: true,
            monitorType: true,
          },
        },
        AcknowledgedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
        ResolvedBy: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.status(200).json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    next(error);
  }
};

export const getIncidentStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.params;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [
      total,
      open,
      acknowledged,
      investigating,
      resolved,
      resolvedToday
    ] = await Promise.all([
      prismaClient.incident.count({ where: { organizationId } }),
      prismaClient.incident.count({ 
        where: { 
          organizationId, 
          status: 'DOWN',
          endTime: null 
        } 
      }),
      prismaClient.incident.count({ 
        where: { 
          organizationId, 
          status: 'MONITORING',
          endTime: null 
        } 
      }),
      prismaClient.incident.count({ 
        where: { 
          organizationId, 
          status: 'INVESTIGATING',
          endTime: null 
        } 
      }),
      prismaClient.incident.count({ 
        where: { 
          organizationId, 
          status: 'RESOLVED',
          endTime: { not: null } 
        } 
      }),
      prismaClient.incident.count({ 
        where: { 
          organizationId, 
          status: 'RESOLVED',
          endTime: { 
            gte: oneDayAgo,
            lte: now
          } 
        } 
      })
    ]);

    // Get all resolved incidents for calculations
    const resolvedIncidents = await prismaClient.incident.findMany({
      where: { 
        organizationId,
        status: 'RESOLVED',
        endTime: { not: null },
        Acknowledged: true,
        AcknowledgedBy: { isNot: null }
      },
      include: {
        AcknowledgedBy: true
      }
    });

    // Calculate average response time (time from start to acknowledgment)
    // Note: Since we don't have an AcknowledgedAt timestamp, we'll use the current time as a fallback
    const responseTimes = resolvedIncidents
      .filter(incident => incident.Acknowledged && incident.AcknowledgedBy)
      .map(incident => ({
        responseTime: (new Date().getTime() - new Date(incident.startTime).getTime()) / (1000 * 60)
      }));

    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, { responseTime }) => sum + responseTime, 0) / responseTimes.length)
      : 0;

    // Calculate average resolution time (time from start to end)
    const resolutionTimes = resolvedIncidents
      .filter(incident => incident.endTime)
      .map(incident => ({
        resolutionTime: (new Date(incident.endTime!).getTime() - new Date(incident.startTime).getTime()) / (1000 * 60)
      }));

    const avgResolutionTime = resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((sum, { resolutionTime }) => sum + resolutionTime, 0) / resolutionTimes.length)
      : 0;

    // Calculate uptime percentage (simplified - in a real app, this would be more complex)
    const uptime = 99.9; // This would be calculated based on actual monitoring data

    res.status(200).json({
      total,
      open,
      acknowledged,
      investigating,
      resolved,
      resolvedToday,
      avgResponseTime,
      avgResolutionTime,
      uptime
    });
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    next(error);
  }
};
