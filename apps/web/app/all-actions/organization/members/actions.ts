'use client';

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
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/organization/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update organization member' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Update organization member action error:', error);
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
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/organization/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to remove organization member' };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Remove organization member action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}