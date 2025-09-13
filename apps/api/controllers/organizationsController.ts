
import { Request, Response } from 'express';
import { prismaClient } from '@uptimematrix/store';

export const getOrganizationDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Assuming userId is available from auth middleware
    const organizationId = req.user?.organizationId;
    console.log(`[Backend] GET /organization/${id} - UserId: ${userId}`);

    if (!userId) {
      console.warn(`[Backend] Unauthorized: User ID not found for GET /organization/${id}`);
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const organization = await prismaClient.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        totalMembers: true,
        createdOn: true,
        industry: true,
        location: true,
        memberSince: true,
        foundedYear: true,
        about: true,
        members: {
          select: {
            userId: true, // Explicitly select userId
            isVerified: true, // Also ensure isVerified is selected
            email: true, // Also ensure email is selected
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                phone: true,
                memberOfTeamEntries: {
                  select: {
                    team: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
            role: { select: { name: true } },
          }
        },
        websites: true,
        escalationPolicies: true,
        integrations: true,
        statusPages: true,
        reportServices: true,
        incidents: true,
        teams: true,
      },
    });

    if (!organization) {
      console.warn(`[Backend] Organization ${id} not found.`);
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if the requesting user is a member of this organization
    const isMember = organization.members.some(member => member.userId === userId);
    if (!isMember) {
      console.warn(`[Backend] Forbidden: User ${userId} is not a member of organization ${id}`);
      return res.status(403).json({ message: 'Forbidden: Not a member of this organization' });
    }

    console.log(`[Backend] Successfully fetched details for organization ${organization.id}.`);
    // Format the response data
    const formattedOrganization = {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      status: organization.status,
      totalMembers: organization.totalMembers,
      createdOn: organization.createdOn,
      industry: organization.industry,
      location: organization.location,
      memberSince: organization.memberSince,
      foundedYear: organization.foundedYear,
      about: organization.about,
      members: organization.members.map(member => {
        console.log(`[Backend] Member in getOrganizationDetails: userId = ${member.userId}, email = ${member.email}, isVerified = ${member.isVerified}`);
        return {
          id: member.userId,
          name: member.user?.fullName || member.email,
          email: member.email,
          phone: member.user?.phone || 'Not provided',
          teams: member.user?.memberOfTeamEntries.map(entry => entry.team.name) || [], // Reverted to return an array of team names
          role: member.role.name,
          avatar: member.user?.avatar || null,
          initials: "AD",
          isVerified: member.isVerified,
        };
      }),
    };

    res.json(formattedOrganization);

  } catch (error) {
    console.error('Error fetching organization details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Assuming userId is available from auth middleware
    console.log(`[Backend] DELETE /organization/${id} - UserId: ${userId}`);

    if (!userId) {
      console.warn(`[Backend] Unauthorized: User ID not found for DELETE /organization/${id}`);
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    // First, check if the organization exists and if the user has permission to delete it
    const organization = await prismaClient.organization.findUnique({
      where: { id: id },
      include: {
        members: { where: { userId: userId, role: { name: "Owner" } } } // Only owner can delete
      }
    });

    if (!organization) {
      console.warn(`[Backend] Organization ${id} not found for deletion.`);
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Ensure the user is the owner (or has appropriate permissions)
    if (organization.members.length === 0) {
      console.warn(`[Backend] Forbidden: User ${userId} is not owner of organization ${id} for deletion.`);
      return res.status(403).json({ message: 'Forbidden: Only organization owners can delete' });
    }

    // Perform deletion
    await prismaClient.organization.delete({
      where: { id: id },
    });

    console.log(`[Backend] Successfully deleted organization ${id}.`);
    res.status(200).json({ message: 'Organization deleted successfully' });

  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
