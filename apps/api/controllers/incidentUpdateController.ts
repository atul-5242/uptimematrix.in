import { Request, Response } from 'express';
import { prismaClient } from '@uptimematrix/store';

type User = {
  id: string;
  fullName: string | null;
  email: string;
  avatar: string | null;
};

type Incident = {
  id: string;
  status: string;
  Acknowledged: boolean;
  AcknowledgedBy: User | null;
  acknowledgedById: string | null;
  Resolved: boolean;
  ResolvedBy: User | null;
  resolvedById: string | null;
};

export const createIncidentUpdate = async (req: Request, res: Response) => {
  try {
    const { message, type } = req.body;
    const { incidentId } = req.params; // Changed from req.query to req.params
    const userId = req.user.id;

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'Incident ID is required' });
    }

    if (!message || !type) {
      return res.status(400).json({ success: false, error: 'Message and type are required' });
    }

    const incident = await prismaClient.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const update = await prismaClient.incidentUpdate.create({
      data: {
        message,
        type,
        incidentId,
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: update.id,
        message: update.message,
        type: update.type,
        author: {
          id: user.id,
          name: user.fullName || 'Unknown',
          email: user.email,
          avatar: user.avatar
        },
        createdAt: update.createdAt,
        timestamp: update.createdAt, // Add timestamp for frontend compatibility
      },
    });
  } catch (error) {
    console.error('Error creating incident update:', error);
    return res.status(500).json({ success: false, error: 'Failed to create incident update' });
  }
};

export const getIncidentUpdates = async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params; // Changed from req.query to req.params

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'Incident ID is required' });
    }

    const updates = await prismaClient.incidentUpdate.findMany({
      where: { incidentId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: updates.map(update => ({
        id: update.id,
        message: update.message,
        type: update.type,
        author: update.user ? (update.user.fullName || update.user.email || 'Unknown') : 'Unknown',
        createdAt: update.createdAt,
        timestamp: update.createdAt, // Add timestamp for frontend compatibility
      })),
    });
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch incident updates' });
  }
};

export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { incidentId } = req.params; // Changed from req.query to req.params
    const userId = req.user.id;

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'Incident ID is required' });
    }

    const validStatuses = ['INVESTIGATING', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const incident = await prismaClient.incident.findUnique({
      where: { id: incidentId },
      include: {
        AcknowledgedBy: true,
        ResolvedBy: true,
      },
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const updateData = { 
      status,
      ...(status === 'INVESTIGATING' && {
        Acknowledged: true,
        acknowledgedById: userId,
      }),
      ...(status === 'RESOLVED' && {
        Resolved: true,
        resolvedById: userId,
        endTime: new Date(),
        ...(!incident.Acknowledged && {
          Acknowledged: true,
          acknowledgedById: userId,
        }),
      }),
    };

    const updatedIncident = await prismaClient.incident.update({
      where: { id: incidentId },
      data: updateData,
      include: {
        AcknowledgedBy: true,
        ResolvedBy: true,
      },
    });

    // Create a system update
    await prismaClient.incidentUpdate.create({
      data: {
        message: `Incident status changed to ${status}`,
        type: 'system',
        incidentId,
        userId,
      },
    });

    return res.json({
      success: true,
      data: updatedIncident,
    });
  } catch (error) {
    console.error('Error updating incident status:', error);
    return res.status(500).json({ success: false, error: 'Failed to update incident status' });
  }
};