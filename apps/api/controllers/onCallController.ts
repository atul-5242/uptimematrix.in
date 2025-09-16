import { Request, Response } from 'express';
import {prismaClient} from '@uptimematrix/store';

interface AuthenticatedRequest extends Request {
  user?: { id: string; organizationId?: string };
}

// Create a new on-call schedule
export const createOnCallSchedule = async (req: AuthenticatedRequest, res: Response) => {
  const { name, description } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  try {
    const onCallSchedule = await prismaClient.onCallSchedule.create({
      data: {
        name,
        description,
        organizationId,
      },
    });
    res.status(201).json(onCallSchedule);
  } catch (error) {
    console.error('Error creating on-call schedule:', error);
    res.status(500).json({ message: 'Failed to create on-call schedule.' });
  }
};

// Get all on-call schedules for an organization
export const getOnCallSchedules = async (req: AuthenticatedRequest, res: Response) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  try {
    const onCallSchedules = await prismaClient.onCallSchedule.findMany({
      where: {
        organizationId,
      },
      include: {
        userAssignments: { include: { user: true } },
        teamAssignments: { include: { team: true } },
      },
    });
    res.status(200).json(onCallSchedules);
  } catch (error) {
    console.error('Error fetching on-call schedules:', error);
    res.status(500).json({ message: 'Failed to retrieve on-call schedules.' });
  }
};

// Update an existing on-call schedule
export const updateOnCallSchedule = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  try {
    const updatedSchedule = await prismaClient.onCallSchedule.update({
      where: { id, organizationId },
      data: {
        name: name || undefined,
        description: description || undefined,
      },
      include: {
        userAssignments: { include: { user: true } },
        teamAssignments: { include: { team: true } },
      },
    });
    res.status(200).json(updatedSchedule);
  } catch (error) {
    console.error('Error updating on-call schedule:', error);
    res.status(500).json({ message: 'Failed to update on-call schedule.' });
  }
};

// Assign a user to an on-call schedule
export const assignUserToOnCall = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId } = req.params;
  const { userId } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId) {
    return res.status(400).json({ message: 'Schedule ID is required.' });
  }

  try {
    // Check if the schedule exists and belongs to the organization
    const schedule = await prismaClient.onCallSchedule.findUnique({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'On-call schedule not found or does not belong to your organization.' });
    }

    const existingAssignment = await prismaClient.onCallUserAssignment.findUnique({
      where: { userId_scheduleId: { userId, scheduleId } },
    });

    if (existingAssignment) {
      return res.status(409).json({ message: 'User is already assigned to this on-call schedule.' });
    }

    const onCallUserAssignment = await prismaClient.onCallUserAssignment.create({
      data: {
        scheduleId: scheduleId,
        userId,
      },
      include: { user: true },
    });
    res.status(201).json(onCallUserAssignment);
  } catch (error) {
    console.error('Error assigning user to on-call schedule:', error);
    res.status(500).json({ message: 'Failed to assign user to on-call schedule.' });
  }
};

// Update an existing user assignment to an on-call schedule
export const updateOnCallUserAssignment = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId, userId } = req.params;
  const { newUserId } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId) {
    return res.status(400).json({ message: 'Schedule ID is required.' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'User ID for existing assignment is required.' });
  }

  try {
    // Check if the schedule exists and belongs to the organization
    const schedule = await prismaClient.onCallSchedule.findUnique({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'On-call schedule not found or does not belong to your organization.' });
    }

    // Check if the new user is already assigned to this schedule
    const newAssignmentExists = await prismaClient.onCallUserAssignment.findUnique({
      where: { userId_scheduleId: { userId: newUserId, scheduleId } },
    });

    if (newAssignmentExists) {
      return res.status(409).json({ message: 'New user is already assigned to this on-call schedule.' });
    }

    // Find the existing assignment to update
    const existingAssignment = await prismaClient.onCallUserAssignment.findUnique({
      where: { userId_scheduleId: { userId, scheduleId } },
    });

    if (!existingAssignment) {
      return res.status(404).json({ message: 'Original user assignment not found.' });
    }

    const updatedAssignment = await prismaClient.onCallUserAssignment.update({
      where: { id: existingAssignment.id },
      data: {
        userId: newUserId,
      },
      include: { user: true },
    });

    res.status(200).json(updatedAssignment);
  } catch (error) {
    console.error('Error updating user assignment to on-call schedule:', error);
    res.status(500).json({ message: 'Failed to update user assignment to on-call schedule.' });
  }
};

// Get all users assigned to an on-call schedule
export const getOnCallUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId } = req.params;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId) {
    return res.status(400).json({ message: 'Schedule ID is required.' });
  }

  try {
    const onCallUsers = await prismaClient.onCallUserAssignment.findMany({
      where: {
        scheduleId,
        schedule: { organizationId },
      },
      include: { user: true },
    });
    res.status(200).json(onCallUsers);
  } catch (error) {
    console.error('Error fetching on-call users:', error);
    res.status(500).json({ message: 'Failed to retrieve on-call users.' });
  }
};

// Assign a team to an on-call schedule
export const assignTeamToOnCall = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId } = req.params;
  const { teamId } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId) {
    return res.status(400).json({ message: 'Schedule ID is required.' });
  }

  try {
    // Check if the schedule exists and belongs to the organization
    const schedule = await prismaClient.onCallSchedule.findUnique({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'On-call schedule not found or does not belong to your organization.' });
    }

    const existingAssignment = await prismaClient.onCallTeamAssignment.findUnique({
      where: { teamId_scheduleId: { teamId, scheduleId } },
    });

    if (existingAssignment) {
      return res.status(409).json({ message: 'Team is already assigned to this on-call schedule.' });
    }

    const onCallTeamAssignment = await prismaClient.onCallTeamAssignment.create({
      data: {
        scheduleId: scheduleId,
        teamId,
      },
      include: { team: true },
    });
    res.status(201).json(onCallTeamAssignment);
  } catch (error) {
    console.error('Error assigning team to on-call schedule:', error);
    res.status(500).json({ message: 'Failed to assign team to on-call schedule.' });
  }
};

// Update an existing team assignment to an on-call schedule
export const updateOnCallTeamAssignment = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId, teamId } = req.params;
  const { newTeamId } = req.body;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId) {
    return res.status(400).json({ message: 'Schedule ID is required.' });
  }

  if (!teamId) {
    return res.status(400).json({ message: 'Team ID for existing assignment is required.' });
  }

  try {
    // Check if the schedule exists and belongs to the organization
    const schedule = await prismaClient.onCallSchedule.findUnique({
      where: { id: scheduleId, organizationId },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'On-call schedule not found or does not belong to your organization.' });
    }

    // Check if the new team is already assigned to this schedule
    const newAssignmentExists = await prismaClient.onCallTeamAssignment.findUnique({
      where: { teamId_scheduleId: { teamId: newTeamId, scheduleId } },
    });

    if (newAssignmentExists) {
      return res.status(409).json({ message: 'New team is already assigned to this on-call schedule.' });
    }

    // Find the existing assignment to update
    const existingAssignment = await prismaClient.onCallTeamAssignment.findUnique({
      where: { teamId_scheduleId: { teamId, scheduleId } },
    });

    if (!existingAssignment) {
      return res.status(404).json({ message: 'Original team assignment not found.' });
    }

    const updatedAssignment = await prismaClient.onCallTeamAssignment.update({
      where: { id: existingAssignment.id },
      data: {
        teamId: newTeamId,
      },
      include: { team: true },
    });

    res.status(200).json(updatedAssignment);
  } catch (error) {
    console.error('Error updating team assignment to on-call schedule:', error);
    res.status(500).json({ message: 'Failed to update team assignment to on-call schedule.' });
  }
};

// Get all teams assigned to an on-call schedule
export const getOnCallTeams = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId } = req.params;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId) {
    return res.status(400).json({ message: 'Schedule ID is required.' });
  }

  try {
    const onCallTeams = await prismaClient.onCallTeamAssignment.findMany({
      where: {
        scheduleId,
        schedule: { organizationId },
      },
      include: { team: true },
    });
    res.status(200).json(onCallTeams);
  } catch (error) {
    console.error('Error fetching on-call teams:', error);
    res.status(500).json({ message: 'Failed to retrieve on-call teams.' });
  }
};

export const removeUserFromOnCall = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId, onCallUserAssignmentId } = req.params;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId || !onCallUserAssignmentId) {
    return res.status(400).json({ message: 'Schedule ID and On-Call User Assignment ID are required.' });
  }

  try {
    // Verify the assignment exists and belongs to the organization
    const assignment = await prismaClient.onCallUserAssignment.findFirst({
      where: {
        id: onCallUserAssignmentId,
        scheduleId,
        schedule: { organizationId },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'On-call user assignment not found.' });
    }

    await prismaClient.onCallUserAssignment.delete({
      where: { id: onCallUserAssignmentId },
    });

    res.status(200).json({ message: 'User removed from on-call schedule successfully.' });
  } catch (error) {
    console.error('Error removing user from on-call schedule:', error);
    res.status(500).json({ message: 'Failed to remove user from on-call schedule.' });
  }
};

export const removeTeamFromOnCall = async (req: AuthenticatedRequest, res: Response) => {
  const { scheduleId, onCallTeamAssignmentId } = req.params;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required.' });
  }

  if (!scheduleId || !onCallTeamAssignmentId) {
    return res.status(400).json({ message: 'Schedule ID and On-Call Team Assignment ID are required.' });
  }

  try {
    // Verify the assignment exists and belongs to the organization
    const assignment = await prismaClient.onCallTeamAssignment.findFirst({
      where: {
        id: onCallTeamAssignmentId,
        scheduleId,
        schedule: { organizationId },
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'On-call team assignment not found.' });
    }

    await prismaClient.onCallTeamAssignment.delete({
      where: { id: onCallTeamAssignmentId },
    });

    res.status(200).json({ message: 'Team removed from on-call schedule successfully.' });
  } catch (error) {
    console.error('Error removing team from on-call schedule:', error);
    res.status(500).json({ message: 'Failed to remove team from on-call schedule.' });
  }
};