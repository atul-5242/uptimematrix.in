'use client'

import { revalidatePath } from 'next/cache'

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
      throw new Error('Authentication token not found');
    }

    const response = await fetch('/api/status-pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create status page');
    }

    const result = await response.json();
    revalidatePath('/dashboard/status-pages');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating status page:', error);
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
      throw new Error('Authentication token not found');
    }

    const response = await fetch('/api/status-pages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch status pages');
    }

    const responseData = await response.json();
    
    // Return the response in the expected format
    return {
      success: true,
      data: responseData.data || []
    };
  } catch (error) {
    console.error('Error in getStatusPages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch status pages',
      data: []
    };
  }
}
