'use client';

import { useAppSelector } from "@/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


// Member-specific actions
export async function inviteMemberToOrganization(memberData: { 
  name: string; 
  email: string; 
  roleId: string;
  phone?: string; 
  teamIds?: string[]; // Changed to accept an array of team IDs
}) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // First, invite to organization
    const orgResponse = await fetch(`${API_BASE_URL}/api/organizations/invite`, {
      method: 'POST',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: memberData.name,
        email: memberData.email,
        roleId: memberData.roleId,
        phone: memberData.phone, 
      }),
    });

    const orgData = await orgResponse.json();

    if (!orgResponse.ok) {
      return { success: false, error: orgData.error || 'Failed to invite member to organization' };
    }

    // If teamIds are provided, also add to teams
    if (memberData.teamIds && orgData.data?.userId) {
      const addTeamPromises = memberData.teamIds.map(teamId => 
        fetch('/api/team-section/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamId: teamId,
            userId: orgData.data.userId,
            roleId: memberData.roleId,
            isTeamLead: false
          }),
        })
      );
      const teamResults = await Promise.all(addTeamPromises);
      for (const res of teamResults) {
        if (!res.ok) {
          console.warn('Member invited to organization but failed to add to one or more teams');
          break; // Or handle individual errors as needed
        }
      }
    }

    return { success: true, data: orgData.data };
  } catch (error) {
    console.error('Invite member action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getMembersByTeam(teamId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json(); 
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/team-section/members?teamId=${teamId}`, {
      method: 'GET',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch team members' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get members by team action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function bulkAddMembersToTeam(teamId: string, memberIds: string[], roleId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const results = [];
    const errors = [];

    for (const userId of memberIds) {
      try {
        const response = await fetch('/api/team-section/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamId,
            userId,
            roleId,
            isTeamLead: false
          }),
        });

        const data = await response.json();

        if (response.ok) {
          results.push(data.data);
        } else {
          errors.push({ userId, error: data.error });
        }
      } catch (error) {
        errors.push({ userId, error: 'Network error' });
      }
    }

    return { 
      success: true, 
      data: results, 
      errors: errors.length > 0 ? errors : undefined,
      summary: `Added ${results.length} members successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    };
  } catch (error) {
    console.error('Bulk add members action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function transferMemberBetweenTeams(memberId: string, fromTeamId: string, toTeamId: string, roleId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // First, get member details
    const memberResponse = await fetch(`/api/team-section/members?teamId=${fromTeamId}`, {
      method: 'GET',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const memberData = await memberResponse.json();
    if (!memberResponse.ok) {
      return { success: false, error: 'Failed to fetch member details' };
    }

    const member = memberData.data.find((m: any) => m.id === memberId);
    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Remove from current team
const removeResponse = await fetch(`/api/team-section/members/${fromTeamId}/${memberId}`, {
      method: 'DELETE',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!removeResponse.ok) {
      return { success: false, error: 'Failed to remove member from current team' };
    }

    // Add to new team
    const addResponse = await fetch('/api/team-section/members', {
      method: 'POST',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        teamId: toTeamId,
        userId: member.userId,
        roleId,
        isTeamLead: false
      }),
    });

    const addData = await addResponse.json();

    if (!addResponse.ok) {
      return { success: false, error: addData.error || 'Failed to add member to new team' };
    }

    return { success: true, data: addData.data };
  } catch (error) {
    console.error('Transfer member action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Get all members across organization
export async function getMembers( currentOrganizationId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }
    const response = await fetch(`${API_BASE_URL}/organization/${currentOrganizationId}`, {
      method: 'GET',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    console.log("Raw members data from backend:", data);

    if (!response.ok) {
        return { success: false, error: data.message || "Failed to fetch members" };
    }
    return { success: true, data: { members: data.members } };
  } catch (error) {
    console.error('Get members action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Invite member (alias for inviteMemberToOrganization)
export async function inviteMember(memberData: { 
  name: string; 
  email: string; 
  phone?: string;
  role: string;
  teamIds?: string[]; // Changed to accept an array of team IDs
}) {
  return inviteMemberToOrganization({
    name: memberData.name,
    email: memberData.email,
    roleId: memberData.role, 
    phone: memberData.phone, 
    teamIds: memberData.teamIds // Pass teamIds array to the alias
  });
}

// Transfer member (alias for transferMemberBetweenTeams)
export async function transferMember(memberId: string, data: { teamIds: string[]; role: string }) {
  // For now, we'll just update the member's team - in a real implementation,
  // you'd need to know the current team to transfer from
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    // This is a simplified version - in practice you'd need more complex logic
    const response = await fetch(`/api/team-section/members/${memberId}`, {
      method: 'PUT',
      headers: {
                'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        teamIds: data.teamIds, // Changed to teamIds array
        roleId: data.role
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { success: false, error: responseData.error || 'Failed to transfer member' };
    }

    return { success: true, data: responseData.data };
  } catch (error) {
    console.error('Transfer member action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}
