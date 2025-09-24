import type { Request, Response } from "express";
import { prismaClient } from "@uptimematrix/store";

type IncidentStatus = 'RESOLVED' | 'INVESTIGATING' | 'MONITORING' | 'DOWN' | 'MAINTENANCE';
type IncidentSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NONE' | 'MAINTENANCE';

interface IncidentWithDetails {
  id: string;
  title: string;
  serviceName: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startTime: Date;
  endTime: Date | null;
  organizationId: string;
  serviceId: string | null;
  impact: string;
  createdAt: Date;
  Acknowledged: boolean;
  AcknowledgedBy: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
  Resolved: boolean;
  ResolvedBy: {
    id: string;
    fullName: string | null;
    email: string;
  } | null;
  service: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  organization: {
    id: string;
    name: string;
  };
  website: {
    id: string;
    name: string;
    url: string;
  } | null;
}

export const getIncidentAnalytics = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
    }

    // Get incident with related data
    const incident = await prismaClient.incident.findUnique({
      where: { id: incidentId },
      include: {
        AcknowledgedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        ResolvedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        website: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
    }) as unknown as IncidentWithDetails | null;

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check if user has access to this incident's organization
    const userOrg = await prismaClient.organizationMember.findFirst({
      where: {
        userId,
        organizationId: incident.organizationId,
      },
    });

    if (!userOrg) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate metrics
    const startTime = new Date(incident.startTime);
    const endTime = incident.endTime ? new Date(incident.endTime) : new Date();
    const responseTime = incident.Acknowledged && incident.AcknowledgedBy
      ? endTime.getTime() - startTime.getTime()
      : null;

    const resolutionTime = incident.Resolved && incident.ResolvedBy && incident.endTime
      ? new Date(incident.endTime).getTime() - startTime.getTime()
      : null;

    // Get related incidents for analysis
    const relatedIncidents = await prismaClient.incident.findMany({
      where: {
        serviceId: incident.serviceId,
        id: { not: incident.id },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Prepare response
    const response = {
      id: incident.id,
      title: incident.title,
      description: incident.impact || '',
      status: incident.status,
      severity: incident.severity,
      createdAt: incident.createdAt,
      acknowledgedAt: incident.Acknowledged ? startTime.toISOString() : null,
      resolvedAt: incident.Resolved && incident.endTime ? incident.endTime.toISOString() : null,
      service: { 
        id: incident.serviceId || '', 
        name: incident.serviceName, 
        description: '' 
      },
      organization: { 
        id: incident.organizationId, 
        name: incident.organization.name 
      },
      metrics: {
        responseTimeMs: responseTime,
        resolutionTimeMs: resolutionTime,
        relatedIncidentsCount: relatedIncidents.length,
      },
      acknowledgedBy: incident.Acknowledged ? {
        id: incident.AcknowledgedBy?.id || '',
        name: incident.AcknowledgedBy?.fullName || 'Unknown',
        email: incident.AcknowledgedBy?.email || '',
        timestamp: incident.AcknowledgedBy ? incident.startTime : null,
      } : null,
      resolvedBy: incident.Resolved ? {
        id: incident.ResolvedBy?.id || '',
        name: incident.ResolvedBy?.fullName || 'Unknown',
        email: incident.ResolvedBy?.email || '',
        timestamp: incident.ResolvedBy ? (incident.endTime || new Date()) : null,
      } : null,
      relatedIncidents: relatedIncidents.map(inc => ({
        id: inc.id,
        title: inc.title,
        status: inc.status,
        severity: inc.severity,
        createdAt: inc.createdAt,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching incident analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const { status } = req.body as { status: 'RESOLVED' | 'INVESTIGATING' | 'MONITORING' | 'DOWN' | 'MAINTENANCE' | 'CLOSED' };
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Get the incident first to check permissions
    const incident = await prismaClient.incident.findUnique({
      where: { id: incidentId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check if user has access to this incident's organization
    const userOrg = incident.organization.members.find(
      (member) => member.userId === userId
    );

    if (!userOrg) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare update data
    const updateData: any = {
      status,
    };

    // Handle status-specific updates
    if (status === 'INVESTIGATING' && !incident.Acknowledged) {
      updateData.Acknowledged = true;
      updateData.acknowledgedById = userId;
    } else if (status === 'RESOLVED' && !incident.Resolved) {
      updateData.Resolved = true;
      updateData.resolvedById = userId;
      updateData.endTime = new Date();
    } else if (status === 'INVESTIGATING' && incident.status === 'RESOLVED') {
      // If re-opening an incident that was resolved
      updateData.Resolved = false;
      updateData.resolvedById = null;
      updateData.endTime = null;
    }

    // Update the incident
    const updatedIncident = await prismaClient.incident.update({
      where: { id: incidentId },
      data: updateData,
    });

    res.json({
      success: true,
      data: updatedIncident,
    });
  } catch (error) {
    console.error('Error updating incident status:', error);
    res.status(500).json({ message: 'Failed to update incident status' });
  }
};

export const createIncidentUpdate = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const { message, type } = req.body as { message: string; type: 'comment' | 'incident_report' };
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
    }

    if (!message || !type) {
      return res.status(400).json({ message: 'Message and type are required' });
    }

    // Get the incident first to check permissions
    const incident = await prismaClient.incident.findUnique({
      where: { id: incidentId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check if user has access to this incident's organization
    const userOrg = incident.organization.members.find(
      (member) => member.userId === userId
    );

    if (!userOrg) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user details
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the incident update
    const update = await prismaClient.incidentUpdate.create({
      data: {
        incidentId,
        message,
        type,
        userId,
        createdAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        id: update.id,
        message: update.message,
        type: update.type,
        author: user.fullName || user.email,
        timestamp: update.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating incident update:', error);
    res.status(500).json({ message: 'Failed to create incident update' });
  }
};

export const getIncidentUpdates = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!incidentId) {
      return res.status(400).json({ message: 'Incident ID is required' });
    }

    // Get the incident first to check permissions
    const incident = await prismaClient.incident.findUnique({
      where: { id: incidentId },
      include: {
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check if user has access to this incident's organization
    const userOrg = incident.organization.members.find(
      (member) => member.userId === userId
    );

    if (!userOrg) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get incident updates
    const updates = await prismaClient.incidentUpdate.findMany({
      where: { incidentId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUpdates = updates.map(update => ({
      id: update.id,
      message: update.message,
      type: update.type,
      author: update.user.fullName || update.user.email,
      timestamp: update.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: formattedUpdates,
    });
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    res.status(500).json({ message: 'Failed to fetch incident updates' });
  }
};
