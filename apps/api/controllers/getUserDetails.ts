import { Request, Response } from 'express';
import { prismaClient } from '@uptimematrix/store';

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    // Safely access user ID from the request
    const userId = req.user?.id;
    const organizationId = req.query.organizationId as string | undefined;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        company: true,
        jobTitle: true,
        location: true,
        bio: true,
        avatar: true,
        joinDate: true,
        lastLogin: true,
        isEmailVerified: true,
        selectedOrganizationId: true,
        // Don't use cached role data - we'll fetch fresh data below
        organizationMembers: {
          where: organizationId ? { organizationId: organizationId } : undefined,
          include: {
            organization: true,
            role: {
              include: {
                permissions: true,
              },
            },
          },
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get fresh role and permissions for the selected organization
    let currentRole = null;
    let currentPermissions: string[] = [];
    
    if (user.selectedOrganizationId) {
      const currentMembership = await prismaClient.organizationMember.findFirst({
        where: {
          userId: userId,
          organizationId: user.selectedOrganizationId
        },
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      });
      
      if (currentMembership) {
        currentRole = currentMembership.role.name;
        currentPermissions = currentMembership.role.permissions.map(p => p.name);
        
        console.log(`[API] getUserDetails - Fresh role data for user ${userId} in org ${user.selectedOrganizationId}: ${currentRole}, permissions: ${currentPermissions.join(', ')}`);
        
        // Update the user's cached role data to keep it in sync
        await prismaClient.user.update({
          where: { id: userId },
          data: {
            selectedOrganizationRole: currentRole,
            selectedOrganizationPermissions: currentPermissions
          }
        });
      }
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      companies: user.company,
      jobTitle: user.jobTitle,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar,
      joinDate: user.joinDate,
      lastLogin: user.lastLogin,
      isEmailVerified: user.isEmailVerified,
      selectedOrganizationId: user.selectedOrganizationId,
      selectedOrganizationRole: currentRole,
      selectedOrganizationPermissions: currentPermissions,
      organizations: user.organizationMembers.map((member) => ({
        id: member.organization.id,
        name: member.organization.name,
        description: member.organization.description,
        status: member.organization.status,
        totalMembers: member.organization.totalMembers,
        createdOn: member.organization.createdOn,
        industry: member.organization.industry,
        location: member.organization.location,
        memberSince: member.organization.memberSince,
        foundedYear: member.organization.foundedYear,
        about: member.organization.about,
        role: member.role.name,
        isVerified: member.isVerified,
        permissions: member.role.permissions.map(p => p.name),
      }))
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
  