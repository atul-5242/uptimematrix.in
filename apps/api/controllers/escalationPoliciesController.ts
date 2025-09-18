import { prismaClient, Priority, Severity } from "@uptimematrix/store";
import type { Request, Response } from "express";

/**
 * Get all escalation policies for the logged-in user
 */
export const getEscalationPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await prismaClient.escalationPolicy.findMany({
      where: {
        createdById: req.user.id!,
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
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ policies });
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
  
