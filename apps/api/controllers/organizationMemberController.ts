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
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    // If the role was updated and this member has a user account,
    // ALWAYS update their global organization context if this is their selected organization
    // This ensures the user gets the new permissions immediately
    if (roleId && existingMember.userId) {
      const userToUpdate = await prisma.user.findUnique({
        where: { id: existingMember.userId },
        select: { selectedOrganizationId: true }
      });

      console.log(`[API] Role update - User ${existingMember.userId}, Organization ${organizationId}, User's selected org: ${userToUpdate?.selectedOrganizationId}`);
      console.log(`[API] New role: ${updatedMember.role.name}, New permissions: ${updatedMember.role.permissions.map(p => p.name).join(', ')}`);

      // Update global context if this organization is the user's currently selected organization
      if (userToUpdate?.selectedOrganizationId === organizationId) {
        await prisma.user.update({
          where: { id: existingMember.userId },
          data: {
            selectedOrganizationRole: updatedMember.role.name,
            selectedOrganizationPermissions: updatedMember.role.permissions.map(p => p.name)
          }
        });
        
        console.log(`[API] ✅ Updated global organization context for user ${existingMember.userId} - new role: ${updatedMember.role.name}`);
      } else {
        console.log(`[API] ⚠️ Did not update global context - organization ${organizationId} is not user's selected organization (selected: ${userToUpdate?.selectedOrganizationId})`);
      }
    }

    // Check if the updated member is the current user making the request
    const isCurrentUser = existingMember.userId === userId;
    
    res.json({
      success: true,
      data: updatedMember,
      isCurrentUser: isCurrentUser,
      message: isCurrentUser ? 'Your role has been updated. Please refresh to see changes.' : 'Member updated successfully'
    });
  } catch (error) {
    console.error('Update organization member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};