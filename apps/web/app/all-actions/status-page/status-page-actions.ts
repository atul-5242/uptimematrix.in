'use client'

import { apiRequest, handleApiError, handleApiSuccess } from '@/lib/errorHandler'

export type StatusPageFormData = {
  name: string
  subdomain: string
  customDomain?: string
  description?: string
  visibility: 'public' | 'private'
  password?: string
  theme: 'light' | 'dark' | 'auto'
  branding: {
    primaryColor: string
    headerBg: string
    logo?: string
  }
  serviceGroups: {
    id: string
    name: string
    services: {
      id: string
      name: string
      monitorId: string
    }[]
  }[]
  notifications: {
    email: boolean
    slack: boolean
    webhook: boolean
    sms: boolean
  }
}

export async function createStatusPage(data: StatusPageFormData) {
  try {
    // Fetch token securely from the API route
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Create Status Page');
      return { success: false, error: 'Authentication token not found' };
    }

    const result = await apiRequest('/api/status-pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    }, 'Create Status Page');

    if (result.success) {
      handleApiSuccess('Status page created successfully', 'Create Status Page');
      // revalidatePath removed - should be handled by the component after successful action
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to create status page' };
    }
  } catch (error) {
    handleApiError(error instanceof Error ? error.message : 'Network error occurred', 'Create Status Page');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create status page' 
    };
  }
}

export async function getMonitorsForStatusPage() {
  try {
    // Fetch token securely from the API route
    const tokenResponse = await fetch('/api/auth/get-token');
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get authentication token');
    }
    
    const { token } = await tokenResponse.json();

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch('/api/status-pages/monitors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch monitors');
    }

    // The data is already in the expected format from our API route
    return responseData.data || [];
  } catch (error) {
    console.error('Error in getMonitorsForStatusPage:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch monitors');
  }
}

export async function getStatusPages() {
  try {
    // Fetch token securely from the API route
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Load Status Pages');
      return { success: false, error: 'Authentication token not found', data: [] };
    }

    const result = await apiRequest('/api/status-pages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    }, 'Load Status Pages');
    
    // Return the response in the expected format
    return {
      success: result.success,
      data: result.success ? (result.data || []) : [],
      error: result.error
    };
  } catch (error) {
    handleApiError(error instanceof Error ? error.message : 'Network error occurred', 'Load Status Pages');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch status pages',
      data: []
    };
  }
}

export async function deleteStatusPage(id: string) {
  try {
    // Fetch token securely from the API route
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      handleApiError('Authentication required', 'Delete Status Page');
      return { success: false, error: 'Authentication token not found' };
    }

    const result = await apiRequest(`/api/status-pages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    }, 'Delete Status Page');

    if (result.success) {
      handleApiSuccess('Status page deleted successfully', 'Delete Status Page');
      // revalidatePath removed - should be handled by the component after successful action
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to delete status page' };
    }
  } catch (error) {
    handleApiError(error instanceof Error ? error.message : 'Network error occurred', 'Delete Status Page');
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete status page' 
    };
  }
}