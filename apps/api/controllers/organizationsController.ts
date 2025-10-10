
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
                  where: {
                    team: {
                      organizationId: organizationId // Only include teams from current organization
                    }
                  },
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

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;

    console.log(`[Backend] POST /organizations - UserId: ${userId}, Name: ${name}`);

    if (!userId) {
      console.warn(`[Backend] Unauthorized: User ID not found for POST /organizations`);
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    // Get user details for organization member creation
    const userDetails = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true }
    });

    if (!userDetails) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ message: 'Organization name and description are required' });
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: 'Organization name must be between 2 and 100 characters' });
    }

    // Check if organization with same name already exists for this user
    const existingOrg = await prismaClient.organization.findFirst({
      where: {
        name: name.trim(),
        members: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (existingOrg) {
      return res.status(409).json({ message: 'You already have an organization with this name' });
    }

    // Find or create Admin role
    let adminRole = await prismaClient.role.findUnique({ 
      where: { name: "Admin" },
      include: { permissions: true }
    });
    if (!adminRole) {
      // TODO(stagewise): Create proper permissions instead of mock data
      adminRole = await prismaClient.role.create({ 
        data: { 
          name: "Admin", 
          description: "Administrator with full access"
        },
        include: { permissions: true }
      });
    }

    // Create organization with the user as owner
    const newOrganization = await prismaClient.organization.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        status: 'ACTIVE',
        totalMembers: 1,
        members: {
          create: {
            userId: userId,
            roleId: adminRole.id,
            isVerified: true,
            name: userDetails.fullName || userDetails.email || 'Admin',
            email: userDetails.email || ''
          }
        }
      },
      include: {
        members: {
          include: {
            user: true,
            role: true
          }
        }
      }
    });

    // Update user's selectedOrganizationId to the new organization
    await prismaClient.user.update({
      where: { id: userId },
      data: {
        selectedOrganizationId: newOrganization.id,
        selectedOrganizationRole: adminRole.name,
        selectedOrganizationPermissions: adminRole.permissions.map(p => p.name)
      },
    });

    console.log(`[Backend] Successfully created organization ${newOrganization.id} and set as selected for user ${userId}`);

    // Return the created organization data
    const responseData = {
      id: newOrganization.id,
      name: newOrganization.name,
      description: newOrganization.description,
      status: newOrganization.status,
      totalMembers: newOrganization.totalMembers,
      createdOn: newOrganization.createdOn,
      role: adminRole.name,
      permissions: adminRole.permissions.map(p => p.name),
      isVerified: true
    };

    res.status(201).json({ 
      message: 'Organization created successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error creating organization:', error);
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