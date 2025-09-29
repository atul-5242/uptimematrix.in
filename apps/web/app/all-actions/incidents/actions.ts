"use server"

import { cookies } from 'next/headers';
import type { Incident, IncidentStats } from '@/types/incident';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  return token || null;
}

// Helper function to create authenticated headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function getIncidents(organizationId: string): Promise<Incident[]> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/incidents/${organizationId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch incidents');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw new Error('Failed to fetch incidents');
  }
}

export async function getIncidentStats(organizationId: string): Promise<IncidentStats> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/incidents/stats/${organizationId}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch incident stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    throw new Error('Failed to fetch incident stats');
  }
}

export async function getIncidentAnalytics(incidentId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${encodeURIComponent(incidentId)}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch incident analytics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching incident analytics:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}

export async function updateIncidentStatus(incidentId: string, status: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${encodeURIComponent(incidentId)}/status`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update incident status: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating incident status:', error);
    throw error;
  }
}

export async function createIncidentUpdate(incidentId: string, message: string, type: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${encodeURIComponent(incidentId)}/updates`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ message, type }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create incident update: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Ensure the response has the expected structure
    return {
      success: true,
      data: {
        id: data.data?.id || data.id,
        message: data.data?.message || data.message,
        type: data.data?.type || data.type,
        author: data.data?.author?.name || data.data?.author || data.author || 'Unknown',
        timestamp: data.data?.createdAt || data.data?.timestamp || data.createdAt || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error creating incident update:', error);
    throw error;
  }
}

export async function getIncidentUpdates(incidentId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/incidents/analytics/${encodeURIComponent(incidentId)}/updates`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch incident updates: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Unexpected response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    return []; // Return empty array instead of throwing
  }
}