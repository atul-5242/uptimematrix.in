'use client';

import { apiRequest, handleApiError, handleApiSuccess } from '@/lib/errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;


// Team Management Actions
export async function createTeam(formData: { name: string; description?: string }) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Create Team');
      return { success: false, error: 'Authentication required' };
    }

    const result = await apiRequest('/api/team-section/team', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    }, 'Create Team');

    if (result.success) {
      handleApiSuccess('Team created successfully', 'Create Team');
    }

    return result;
  } catch (error: any) {
    handleApiError(error.message || 'Network error occurred', 'Create Team');
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getTeams() {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch('/api/team-section/team', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch teams' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get teams action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function updateTeam(teamId: string, formData: { name?: string; description?: string }) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/team-section/team/${teamId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update team' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Update team action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Delete Team');
      return { success: false, error: 'Authentication required' };
    }

    const result = await apiRequest(`/api/team-section/team/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, 'Delete Team');

    if (result.success) {
      handleApiSuccess('Team deleted successfully', 'Delete Team');
    }

    return result;
  } catch (error) {
    handleApiError(error instanceof Error ? error.message : 'Network error occurred', 'Delete Team');
    return { success: false, error: 'Network error occurred' };
  }
}

// Team Member Management Actions
export async function addMemberToTeam(teamId: string, memberData: { userId: string; roleId: string; isTeamLead?: boolean }) {
  try {
    console.log("addMemberToTeam: memberData", memberData);
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Add Member to Team');
      return { success: false, error: 'Authentication required' };
    }

    const result = await apiRequest('/api/team-section/members', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ teamId, ...memberData }),
    }, 'Add Member to Team');
    
    console.log("Add member to team request body:", { teamId, ...memberData });

    if (result.success) {
      handleApiSuccess('Member added to team successfully', 'Add Member to Team');
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to add member to team' };
    }
  } catch (error) {
    handleApiError(error instanceof Error ? error.message : 'Network error occurred', 'Add Member to Team');
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getTeamMembers(teamId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      handleApiError('Authentication required', 'Load Team Members');
      return { success: false, error: 'Authentication required' };
    }

    const result = await apiRequest(`/api/team-section/members?teamId=${teamId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    }, 'Load Team Members');

    return {
      success: result.success,
      data: result.success ? result.data : [],
      error: result.error
    };
  } catch (error) {
    handleApiError(error instanceof Error ? error.message : 'Network error occurred', 'Load Team Members');
    return { success: false, error: 'Network error occurred' };
  }
}

export async function updateTeamMember(teamId: string, memberId: string, memberData: { roleId?: string; isTeamLead?: boolean }) {
  try {
        const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/team-section/members/${teamId}/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update team member' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Update team member action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function removeMemberFromTeam(teamId: string, memberId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/team-section/members/${teamId}/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to remove team member' };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Remove team member action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

// Utility Actions
export async function getAvailableUsers(teamId: string) {
  try {
        const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/available-users`, {
      method: 'GET',
      headers: {
    'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch available users' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get available users action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getRoles() {
  try {
      const tokenResponse = await fetch('/api/auth/get-token');
      const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch('/api/team-section/roles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch roles' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get roles action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}
