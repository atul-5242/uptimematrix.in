'use client';

import { apiRequest, handleApiError, handleApiSuccess } from '@/lib/errorHandler';

// Organization Member Management Actions

export async function updateOrganizationMember(memberId: string, memberData: { 
  name?: string; 
  email?: string; 
  roleId?: string; 
  isVerified?: boolean 
}) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      handleApiError('Authentication required', 'Update Member');
      return { success: false, error: 'Authentication required' };
    }

    const result = await apiRequest(`/api/organization/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    }, 'Update Member');

    if (result.success) {
      handleApiSuccess('Member updated successfully', 'Update Member');
    }

    return result;
  } catch (error: any) {
    handleApiError(error.message || 'Network error occurred', 'Update Member');
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getRoles() {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      handleApiError('Authentication required', 'Load Roles');
      return { success: false, error: 'Authentication required' };
    }

    return await apiRequest('/api/team-section/roles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    }, 'Load Roles');
  } catch (error: any) {
    handleApiError(error.message || 'Network error occurred', 'Load Roles');
    return { success: false, error: 'Network error occurred' };
  }
}

export async function getOrganizationMembers() {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch('/api/teams/all-organization-members', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch organization members' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get organization members action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function removeOrganizationMember(memberId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Remove Member');
      return { success: false, error: 'Authentication required' };
    }

    const result = await apiRequest(`/api/organization/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, 'Remove Member');

    if (result.success) {
      handleApiSuccess('Member removed successfully', 'Remove Member');
    }

    return result;
  } catch (error: any) {
    handleApiError(error.message || 'Network error occurred', 'Remove Member');
    return { success: false, error: 'Network error occurred' };
  }
}