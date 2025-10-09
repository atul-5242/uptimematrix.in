import { apiRequest, handleApiError, handleApiSuccess } from '@/lib/errorHandler';

export const fetchOnCallSchedules = async () => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  if (!token) {
    handleApiError('Authentication required', 'Load OnCall Schedules');
    throw new Error('Authentication required');
  }
  
  const result = await apiRequest('/api/oncall/schedules', {
    headers: { 'Authorization': `Bearer ${token}` },
  }, 'Load OnCall Schedules');
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch schedules');
  }
  return result.data;
};

export const fetchTeamMembers = async (teamId: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  if (!token) {
    handleApiError('Authentication required', 'Load Team Members');
    throw new Error('Authentication required');
  }
  
  const result = await apiRequest(`/api/teams/${teamId}/members`, {
    headers: { 'Authorization': `Bearer ${token}` },
  }, 'Load Team Members');
  
  if (!result.success) {
    throw new Error(result.error || `Failed to fetch members for team ${teamId}`);
  }
  return result.data;
};

export const fetchOrganizationMembers = async () => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  if (!token) {
    handleApiError('Authentication required', 'Load Organization Members');
    throw new Error('Authentication required');
  }
  
  const result = await apiRequest('/api/userprofile/organization-members', {
    headers: { 'Authorization': `Bearer ${token}` },
  }, 'Load Organization Members');
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch available users');
  }
  return result.data;
};

export const fetchAvailableTeams = async () => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch('/api/teams', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch available teams');
  }
  return res.json();
};

export const createOnCallSchedule = async (name: string, description: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch('/api/oncall/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create schedule');
  }
  return res.json();
};

export const updateOnCallSchedule = async (scheduleId: string, name: string, description: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch(`/api/oncall/schedules/${scheduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update schedule');
  }
  return res.json();
};

export const addUsersToOnCallSchedule = async (scheduleId: string, userId: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch(`/api/oncall/schedules/${scheduleId}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to add user to schedule');
  }
  return res.json();
};

export const addTeamsToOnCallSchedule = async (scheduleId: string, teamId: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch(`/api/oncall/schedules/${scheduleId}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ teamId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to add team to schedule');
  }
  return res.json();
};

export const removeUsersFromOnCallSchedule = async (scheduleId: string, onCallUserAssignmentId: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch(`/api/oncall/schedules/${scheduleId}/users/${onCallUserAssignmentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to remove user from schedule');
  }
  return res.json();
};

export const removeTeamsFromOnCallSchedule = async (scheduleId: string, onCallTeamAssignmentId: string) => {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  const res = await fetch(`/api/oncall/schedules/${scheduleId}/teams/${onCallTeamAssignmentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to remove team from schedule');
  }
  return res.json();
};
