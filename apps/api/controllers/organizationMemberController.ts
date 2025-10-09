import { Request, Response } from 'express';
import { prismaClient } from '@uptimematrix/store';

const prisma = prismaClient;

// Helper function to check permissions
const hasPermission = async (userId: string, organizationId: string, permission: string) => {
  const userWithMemberships = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizationMembers: {
        where: { organizationId: organizationId },
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      }
    }
  });

  if (!userWithMemberships || userWithMemberships.organizationMembers.length === 0) {
    return false;
  }

  const orgMember = userWithMemberships.organizationMembers[0];
  
  // If the user is an Admin, they have all permissions
  if (orgMember?.role.name === 'Admin') {
    return true;
  }
  
  return orgMember?.role.permissions.some((p: any) => p.name === permission);
};

// Update organization member
export const updateOrganizationMember = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { name, email, roleId, isVerified } = req.body;
    
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Check permissions
    if (!await hasPermission(userId, organizationId, 'member:edit')) {
      return res.status(403).json({ error: 'Insufficient permissions to edit organization members' });
    }

    // Validate member exists and belongs to organization
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId: organizationId
      },
      include: {
        user: true,
        role: true
      }
    });

    if (!existingMember) {
      return res.status(404).json({ error: 'Organization member not found' });
    }

    // Validate role if provided
    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        return res.status(400).json({ error: 'Invalid role specified' });
      }
    }

    // Check if new email conflicts with existing member (if email is being changed)
    if (email && email !== existingMember.email) {
      const emailConflict = await prisma.organizationMember.findFirst({
        where: {
          email: email.trim(),
          organizationId: organizationId,
          id: { not: memberId }
        }
      });

      if (emailConflict) {
        return res.status(400).json({ error: 'A member with this email already exists in the organization' });
      }
    }

    const updatedMember = await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim() }),
        ...(roleId && { roleId }),
        ...(typeof isVerified === 'boolean' && { isVerified })
      },
      include: {
        user: true,
        role: true
      }
    });

    res.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error('Update organization member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};