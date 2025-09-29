
"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;



// Role management actions
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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

export async function getRolePermissions(roleId: string) {
  try {
    const rolesResult = await getRoles();
    
    if (!rolesResult.success) {
      return rolesResult;
    }

    const role = rolesResult.data.find((r: any) => r.id === roleId);
    
    if (!role) {
      return { success: false, error: 'Role not found' };
    }

    return { success: true, data: role.permissions };
  } catch (error) {
    console.error('Get role permissions action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function createRoleAction(roleData: { name: string; description: string; permissions: string[] }) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch('/api/team-section/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create role' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Create role action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function updateRoleAction(roleId: string, roleData: { name: string; description: string; permissions: string[] }) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/team-section/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update role' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Update role action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}

export async function deleteRoleAction(roleId: string) {
  try {
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const response = await fetch(`/api/team-section/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete role' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Delete role action error:', error);
    return { success: false, error: 'Network error occurred' };
  }
}
