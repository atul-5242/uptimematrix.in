import { prismaClient, Priority, Severity, IncidentStatus } from "@uptimematrix/store";
import type { Request, Response } from "express";

/**
 * Helper function to get monitors assigned to a policy
 */
async function getAssignedMonitors(policyId: string): Promise<string[]> {
  try {
    const websites = await prismaClient.website.findMany({
      where: {
        escalationPolicyId: policyId
      },
      select: {
        name: true
      }
    });
    return websites.map(w => w.name);
  } catch (error) {
    console.error('Error fetching assigned monitors:', error);
    return [];
  }
}

/**
 * Get all escalation policies for the logged-in user
 */
export const getEscalationPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await prismaClient.escalationPolicy.findMany({
      where: {
        organizationId: req.user.organizationId!,
      },
      // Include new fields for EscalationPolicy
      select: {
        id: true,
        name: true,
        description: true,
        priorityLevel: true,
        tags: true,
        isActive: true,
        monitorsDown: true,
        terminationCondition: true,
        repeatLastStepIntervalMinutes: true,
        steps: {
          select: {
            id: true,
            stepOrder: true,
            primaryMethods: true,
            additionalMethods: true,
            recipients: true,
            delayMinutes: true,
            repeatCount: true,
            escalateAfter: true,
            customMessage: true,
          },
          orderBy: { stepOrder: "asc" },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the policies for frontend consumption
    const formattedPolicies = await Promise.all(policies.map(async policy => ({
      id: policy.id,
      name: policy.name,
      description: policy.description,
      severity: policy.priorityLevel,
      isActive: policy.isActive,
      tags: policy.tags || [],
      triggerConditions: policy.monitorsDown ? ['Monitor down'] : [],
      assignedMonitors: await getAssignedMonitors(policy.id),
      steps: policy.steps.length,
      alertMethods: [
        ...new Set([
          ...policy.steps.flatMap(step => step.primaryMethods),
          ...policy.steps.flatMap(step => step.additionalMethods)
        ])
      ],
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      lastTriggered: null, // TODO: Add incident tracking
      triggeredCount: 0, // TODO: Add incident tracking
      avgResponseTime: null, // TODO: Add response time tracking
      terminationCondition: policy.terminationCondition,
      repeatLastStepIntervalMinutes: policy.repeatLastStepIntervalMinutes
    })));

    return res.json({ policies: formattedPolicies });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return res.status(500).json({ message: "Failed to fetch policies" });
  }
};

/**
 * Create a new escalation policy
 */
export const createEscalationPolicy = async (req: Request, res: Response) => {
    try {
      const { name, description, severity, isActive, tags, steps, monitorsDown, terminationCondition, repeatLastStepIntervalMinutes } = req.body;
  
      const policy = await prismaClient.escalationPolicy.create({
        data: {
          name,
          description,
          priorityLevel: (severity as string).toLowerCase() as Priority,  // must be a valid enum
          isActive,
          tags: Array.isArray(tags) ? tags : [], // ensure string[]
          createdBy: { connect: { id: req.user.id! } }, // Connect to existing User
          organization: { connect: { id: req.user.organizationId! } }, // Connect to existing Organization
          monitorsDown,
          terminationCondition,
          repeatLastStepIntervalMinutes: terminationCondition === 'repeat_last_step' ? repeatLastStepIntervalMinutes : null,
          steps: {
            create: steps.map((step: any, idx: number) => ({
              stepOrder: idx + 1,
              primaryMethods: step.alertMethod?.primary ?? [],
              additionalMethods: step.alertMethod?.additional ?? [],
              recipients: step.recipients ?? [],
              delayMinutes: step.delayMinutes ?? 0,
              repeatCount: step.repeatCount ?? 1,
              escalateAfter: step.escalateAfter ?? 5,
              customMessage: step.customMessage ?? null,
            })),
          },
        },
        include: { steps: true },
      });
  
      res.status(201).json({ policy });
    } catch (error) {
      console.error("Error creating policy:", error);
      res.status(500).json({ message: "Failed to create policy", error });
    }
  };
  

/**
 * Update an escalation policy
 */
export const updateEscalationPolicy = async (req: Request, res: Response) => {
    try {
      const { id, name, description, severity, isActive, tags, steps, monitorsDown, terminationCondition, repeatLastStepIntervalMinutes } = req.body;
  
      const policy = await prismaClient.escalationPolicy.update({
        where: { 
          id, 
          organizationId: req.user.organizationId!,
        },
        data: {
          name,
          description,
          priorityLevel: severity as Priority,
          isActive,
          tags: Array.isArray(tags) ? tags : [],
          monitorsDown,
          terminationCondition,
          repeatLastStepIntervalMinutes: terminationCondition === 'repeat_last_step' ? repeatLastStepIntervalMinutes : null,
          steps: {
            deleteMany: {}, // clear old steps
            create: steps.map((step: any, idx: number) => ({
              stepOrder: idx + 1,
              primaryMethods: step.alertMethod?.primary ?? [],
              additionalMethods: step.alertMethod?.additional ?? [],
              recipients: step.recipients ?? [],
              delayMinutes: step.delayMinutes ?? 0,
              repeatCount: step.repeatCount ?? 1,
              escalateAfter: step.escalateAfter ?? 5,
              customMessage: step.customMessage ?? null,
            })),
          },
        },
        include: { steps: true },
      });
  
      res.json({ policy });
    } catch (error) {
      console.error("Error updating policy:", error);
      res.status(500).json({ message: "Failed to update policy", error });
    }
  };
  

/**
 * Delete an escalation policy
 */
export const deleteEscalationPolicy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
  
      // Check if the policy exists & belongs to the user
      const policy = await prismaClient.escalationPolicy.findFirst({
        where: {
          id,
          createdById: req.user.id!,
          organizationId: req.user.organizationId!,
        },
      });
  
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
  
      // Delete (steps will cascade if relation is set in schema)
      await prismaClient.escalationPolicy.delete({
        where: { 
          id, 
          organizationId: req.user.organizationId!,
        },
      });
  
      res.json({ message: "Policy deleted successfully", id });
    } catch (error) {
      console.error("Error deleting policy:", error);
      res.status(500).json({ message: "Failed to delete policy", error });
    }
  };

/**
 * Get all monitors with their policy assignments for a specific policy
 */
export const getPolicyMonitors = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    
    // Verify policy belongs to user's organization
    const policy = await prismaClient.escalationPolicy.findFirst({
      where: {
        id: policyId,
        organizationId: req.user.organizationId!
      }
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Get all monitors in the organization
    const monitors = await prismaClient.website.findMany({
      where: {
        organizationId: req.user.organizationId!
      },
      include: {
        ticks: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { timeAdded: "desc" }
    });

    const formattedMonitors = monitors.map(monitor => {
      const latestTick = monitor.ticks[0];
      return {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        method: monitor.method || 'GET',
        interval: Math.floor((monitor.checkInterval || 60000) / 1000), // Convert to seconds
        status: latestTick?.status?.toLowerCase() || 'unknown',
        escalationPolicyId: monitor.escalationPolicyId,
        isPolicyEnabled: monitor.escalationPolicyId === policyId,
        monitorType: monitor.monitorType,
        regions: monitor.regions || [],
        tags: monitor.tags || []
      };
    });

    return res.json({ 
      policy: {
        id: policy.id,
        name: policy.name
      },
      monitors: formattedMonitors 
    });
  } catch (error) {
    console.error("Error fetching policy monitors:", error);
    return res.status(500).json({ message: "Failed to fetch policy monitors" });
  }
};

/**
 * Toggle monitor assignment to escalation policy
 */
export const toggleMonitorPolicy = async (req: Request, res: Response) => {
  try {
    const { policyId, monitorId, enabled } = req.body;
    
    if (!policyId || !monitorId || typeof enabled !== 'boolean') {
      return res.status(400).json({ 
        message: "policyId, monitorId, and enabled (boolean) are required" 
      });
    }

    // Verify policy belongs to user's organization
    const policy = await prismaClient.escalationPolicy.findFirst({
      where: {
        id: policyId,
        organizationId: req.user.organizationId!
      }
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Verify monitor belongs to user's organization
    const monitor = await prismaClient.website.findFirst({
      where: {
        id: monitorId,
        organizationId: req.user.organizationId!
      }
    });

    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }

    // Update monitor's escalation policy assignment
    const updatedMonitor = await prismaClient.website.update({
      where: { id: monitorId },
      data: {
        escalationPolicyId: enabled ? policyId : null
      }
    });
    
    // CRITICAL: Handle existing incidents when policy is toggled
    if (!enabled) {
      // TOGGLE OFF: Stop existing escalations
      // Find any active incidents for this monitor
      const activeIncidents = await prismaClient.incident.findMany({
        where: {
          websiteId: monitorId,
          status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
          endTime: null
        }
      });
      
      if (activeIncidents.length > 0) {
        console.log(`Found ${activeIncidents.length} active incidents for monitor ${monitor.name}. Stopping escalations...`);
        
        // Stop escalations for all active incidents by setting nextEscalationTime to null
        await prismaClient.incident.updateMany({
          where: {
            websiteId: monitorId,
            status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
            endTime: null
          },
          data: {
            nextEscalationTime: null, // This stops further escalations
            // Optionally acknowledge the incidents
            Acknowledged: true,
            status: IncidentStatus.MONITORING
          }
        });
        
        console.log(`✅ Stopped escalations for ${activeIncidents.length} incidents after policy removal`);
      }
    } else {
      // TOGGLE ON: Handle existing incidents that might need escalation policy
      const activeIncidents = await prismaClient.incident.findMany({
        where: {
          websiteId: monitorId,
          status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
          endTime: null,
          nextEscalationTime: null // These were stopped when policy was disabled
        }
      });
      
      if (activeIncidents.length > 0) {
        console.log(`Found ${activeIncidents.length} stopped incidents for monitor ${monitor.name}. Re-enabling escalations...`);
        
        // Get the escalation policy to determine first step
        const escalationPolicy = await prismaClient.escalationPolicy.findUnique({
          where: { id: policyId },
          include: {
            steps: {
              orderBy: { stepOrder: "asc" }
            }
          }
        });
        
        if (escalationPolicy && escalationPolicy.steps.length > 0) {
          const firstStep = escalationPolicy.steps[0];
          
          if (firstStep) {
            const now = new Date();
            
            // Re-start escalations from the first step with a short delay
            const nextEscalationTime = new Date(now.getTime() + (2 * 60 * 1000)); // 2 minutes delay
            
            await prismaClient.incident.updateMany({
              where: {
                websiteId: monitorId,
                status: { in: [IncidentStatus.INVESTIGATING, IncidentStatus.MONITORING] },
                endTime: null,
                nextEscalationTime: null
              },
              data: {
                status: IncidentStatus.INVESTIGATING,
                currentEscalationStepId: firstStep.id,
                nextEscalationTime: nextEscalationTime,
                currentRepeatCount: 0,
                stepDelayCompleted: false,
                escalationStepStartTime: null,
                Acknowledged: false // Re-open for escalation
              }
            });
            
            console.log(`✅ Re-enabled escalations for ${activeIncidents.length} incidents. Next escalation at ${nextEscalationTime.toISOString()}`);
          } else {
            console.warn(`Escalation policy ${policyId} has no valid first step. Cannot re-enable escalations.`);
          }
        } else {
          console.warn(`Escalation policy ${policyId} not found or has no steps. Cannot re-enable escalations.`);
        }
      }
    }

    return res.json({ 
      message: enabled 
        ? `Monitor "${monitor.name}" assigned to policy "${policy.name}"` 
        : `Monitor "${monitor.name}" removed from policy "${policy.name}"`,
      monitor: {
        id: updatedMonitor.id,
        name: updatedMonitor.name,
        escalationPolicyId: updatedMonitor.escalationPolicyId,
        isPolicyEnabled: updatedMonitor.escalationPolicyId === policyId
      }
    });
  } catch (error) {
    console.error("Error toggling monitor policy:", error);
    return res.status(500).json({ message: "Failed to toggle monitor policy" });
  }
};

/**
 * Get detailed policy information including assigned monitors
 */
export const getPolicyDetails = async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    
    const policy = await prismaClient.escalationPolicy.findFirst({
      where: {
        id: policyId,
        organizationId: req.user.organizationId!
      },
      include: {
        steps: {
          orderBy: { stepOrder: "asc" }
        },
        createdBy: {
          select: { fullName: true, email: true }
        }
      }
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Get assigned monitors
    const assignedMonitors = await prismaClient.website.findMany({
      where: {
        escalationPolicyId: policyId,
        organizationId: req.user.organizationId!
      },
      include: {
        ticks: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    const formattedMonitors = assignedMonitors.map(monitor => {
      const latestTick = monitor.ticks[0];
      return {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        method: monitor.method || 'GET',
        interval: Math.floor((monitor.checkInterval || 60000) / 1000),
        status: latestTick?.status?.toLowerCase() || 'unknown',
        monitorType: monitor.monitorType,
        regions: monitor.regions || [],
        tags: monitor.tags || [],
        lastCheck: latestTick?.createdAt
      };
    });

    const formattedPolicy = {
      id: policy.id,
      name: policy.name,
      description: policy.description,
      severity: policy.priorityLevel,
      isActive: policy.isActive,
      tags: policy.tags || [],
      triggerConditions: policy.monitorsDown ? ['Monitor down'] : [],
      assignedMonitors: formattedMonitors,
      steps: policy.steps,
      alertMethods: [
        ...new Set([
          ...policy.steps.flatMap(step => step.primaryMethods),
          ...policy.steps.flatMap(step => step.additionalMethods)
        ])
      ],
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      createdBy: policy.createdBy,
      terminationCondition: policy.terminationCondition,
      repeatLastStepIntervalMinutes: policy.repeatLastStepIntervalMinutes
    };

    return res.json({ policy: formattedPolicy });
  } catch (error) {
    console.error("Error fetching policy details:", error);
    return res.status(500).json({ message: "Failed to fetch policy details" });
  }
};
  
