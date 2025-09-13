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

// Team Management Controllers
export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Check permissions
    if (!await hasPermission(userId, organizationId, 'team:create')) {
      return res.status(403).json({ error: 'Insufficient permissions to create teams' });
    }

    // Validate input
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Team name must be at least 2 characters long' });
    }

    // Check if team name already exists in organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: name.trim(),
        organizationId: organizationId
      }
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'A team with this name already exists' });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        organizationId: organizationId,
        createdById: userId
      },
      include: {
        members: {
          include: {
            user: true,
            role: true
          }
        },
        createdBy: true
      }
    });

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: No organization selected" });
    }
    const organizationId = req.user.organizationId;

    const teams = await prisma.team.findMany({
      where: {
        organizationId: organizationId
      },
      include: {
        members: {
          include: {
            user: true,
            role: true
          }
        },
        createdBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const transformedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      memberCount: team.members.length,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      createdBy: team.createdBy.fullName || team.createdBy.email,
      members: team.members.map(member => ({
        id: member.id,
        name: member.user?.fullName || 'Unknown',
        email: member.user?.email || 'Unknown',
        role: member.role.name,
        isTeamLead: member.isTeamLead,
        joinedAt: member.createdAt
      }))
    }));

    res.json({
      success: true,
      data: transformedTeams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;
    
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Check permissions
    if (!await hasPermission(userId, organizationId, 'team:edit')) {
      return res.status(403).json({ error: 'Insufficient permissions to edit teams' });
    }

    // Validate team exists and belongs to organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId: organizationId
      }
    });

    if (!existingTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if new name conflicts with existing team
    if (name && name !== existingTeam.name) {
      const nameConflict = await prisma.team.findFirst({
        where: {
          name: name.trim(),
          organizationId: organizationId,
          id: { not: teamId }
        }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'A team with this name already exists' });
      }
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: name?.trim() || existingTeam.name,
        description: description?.trim() || existingTeam.description
      },
      include: {
        members: {
          include: {
            user: true,
            role: true
          }
        },
        createdBy: true
      }
    });

    res.json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Check permissions
    if (!await hasPermission(userId, organizationId, 'team:delete')) {
      return res.status(403).json({ error: 'Insufficient permissions to delete teams' });
    }

    // Validate team exists and belongs to organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId: organizationId
      }
    });

    if (!existingTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete team (cascade will handle team members)
    await prisma.team.delete({
      where: { id: teamId }
    });

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Team Member Management Controllers
export const addMemberToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId, roleId, isTeamLead = false } = req.body;
    
    console.log('addMemberToTeam: received request', { teamId, userId, roleId, isTeamLead });

    if (!req.user?.id || !req.user?.organizationId) {
      console.log('addMemberToTeam: Unauthorized - user or organization not found');
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const currentUserId = req.user.id;
    const organizationId = req.user.organizationId;
    console.log('addMemberToTeam: current user and organization', { currentUserId, organizationId });

    // Validate required parameters
    if (!teamId) {
      console.log('addMemberToTeam: Validation failed - teamId required');
      return res.status(400).json({ error: 'Team ID is required' });
    }

    if (!userId || !roleId) {
      console.log('addMemberToTeam: Validation failed - userId or roleId required');
      return res.status(400).json({ error: 'User ID and Role ID are required' });
    }

    // Check permissions
    const hasAddMemberPermission = await hasPermission(currentUserId, organizationId, 'team:add_member');
    console.log('addMemberToTeam: permission check result', { hasAddMemberPermission });

    if (!hasAddMemberPermission) {
      return res.status(403).json({ error: 'Insufficient permissions to add team members' });
    }

    // Validate team exists and belongs to organization
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId: organizationId
      }
    });
    console.log('addMemberToTeam: team found', { teamExists: !!team });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Validate user is a member of the organization
    const orgMember = await prisma.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId,
        isVerified: true
      }
    });
    console.log('addMemberToTeam: organization member found', { orgMemberExists: !!orgMember });

    if (!orgMember) {
      return res.status(400).json({ error: 'User is not a verified member of this organization' });
    }

    // Check if user is already a member of this team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId
      }
    });
    console.log('addMemberToTeam: existing team member check', { memberAlreadyInTeam: !!existingMember });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }

    // Validate role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });
    console.log('addMemberToTeam: role found', { roleExists: !!role });

    if (!role) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: teamId as string,
        userId: userId as string,
        roleId: roleId as string,
        isTeamLead: Boolean(isTeamLead)
      },
      include: {
        user: true,
        role: true,
        team: true
      }
    });
    console.log('addMemberToTeam: team member created successfully', { teamMemberId: teamMember.id });

    res.status(201).json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    console.error('Add member to team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeMemberFromTeam = async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Check permissions
    if (!await hasPermission(userId, organizationId, 'team:remove_member')) {
      return res.status(403).json({ error: 'Insufficient permissions to remove team members' });
    }

    // Validate team exists and belongs to organization
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId: organizationId
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Find and delete team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: teamId
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await prisma.teamMember.delete({
      where: { id: memberId }
    });

    res.json({
      success: true,
      message: 'Member removed from team successfully'
    });
  } catch (error) {
    console.error('Remove member from team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamId, memberId } = req.params;
    const { roleId, isTeamLead } = req.body;
    
    if (!req.user?.id || !req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: User or organization not found" });
    }
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Check permissions
    if (!await hasPermission(userId, organizationId, 'team:edit')) {
      return res.status(403).json({ error: 'Insufficient permissions to edit team members' });
    }

    // Validate team exists and belongs to organization
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId: organizationId
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Find team member
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: teamId
      }
    });

    if (!teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
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

    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...(roleId && { roleId }),
        ...(typeof isTeamLead === 'boolean' && { isTeamLead })
      },
      include: {
        user: true,
        role: true,
        team: true
      }
    });

    res.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: No organization selected" });
    }
    const organizationId = req.user.organizationId;

    // Validate team exists and belongs to organization
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organizationId: organizationId
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: teamId
      },
      include: {
        user: true,
        role: {
          include: {
            permissions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const transformedMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.user?.fullName || 'Unknown',
      email: member.user?.email || 'Unknown',
      phone: member.user?.phone || 'Not provided',
      avatar: member.user?.avatar,
      role: member.role.name,
      roleId: member.role.id,
      isTeamLead: member.isTeamLead,
      permissions: member.role.permissions.map(p => p.name),
      status: member.user ? 'active' : 'inactive',
      joinedAt: member.createdAt,
      userId: member.userId
    }));

    res.json({
      success: true,
      data: transformedMembers
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available users for team assignment
export const getAvailableUsers = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: No organization selected" });
    }
    const organizationId = req.user.organizationId;

    // Get all verified organization members who are not in this team
    const availableUsers = await prisma.organizationMember.findMany({
      where: {
        organizationId: organizationId,
        isVerified: true,
        user: {
          memberOfTeamEntries: {
            none: {
              teamId: teamId
            }
          }
        }
      },
      include: {
        user: true,
        role: true
      }
    });

    const transformedUsers = availableUsers.map(orgMember => ({
      id: orgMember.userId,
      name: orgMember.user?.fullName || orgMember.name,
      email: orgMember.user?.email || orgMember.email,
      avatar: orgMember.user?.avatar,
      organizationRole: orgMember.role.name
    }));

    res.json({
      success: true,
      data: transformedUsers
    });
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    // No specific permissions check needed here as it's just fetching roles.
    // Authorization via authMiddleware ensures a valid user session.

    const roles = await prisma.role.findMany({
      include: {
        permissions: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.name)
    }));

    res.json({
      success: true,
      data: transformedRoles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all organization members
export const getAllOrganizationMembers = async (req: Request, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: "Unauthorized: No organization selected" });
    }
    const organizationId = req.user.organizationId;

    const organizationMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: organizationId,
        isVerified: true,
      },
      include: {
        user: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      } as any, // Cast to any to resolve linter error related to orderBy type mismatch
    });

    console.log(`getAllOrganizationMembers: Querying with organizationId: ${organizationId}, Result count: ${organizationMembers.length}`);
    
    // If no members are found, it might mean there are no verified members for this organization
    // or the organizationId is invalid. The middleware already ensures organizationId exists.
    // We'll proceed to transform and return an empty array if no members are found.
    
    const transformedMembers = organizationMembers.map((orgMember: any) => ({
      id: orgMember.userId || '',
      name: orgMember.user?.fullName || orgMember.name || 'Unknown',
      email: orgMember.user?.email || orgMember.email || 'Unknown',
      phone: orgMember.user?.phone || 'Not provided',
      avatar: orgMember.user?.avatar,
      organizationRole: orgMember.role?.name || 'Unknown',
      organizationRoleId: orgMember.role?.id || '',
      joinedAt: orgMember.createdAt,
      isTeamMember: false, // This will be handled on the frontend if needed
    }));

    res.json({
      success: true,
      data: transformedMembers,
    });
  } catch (error) {
    console.error('Get all organization members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};