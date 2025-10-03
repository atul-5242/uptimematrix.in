// Note: These are client-safe helpers that call our Next.js API routes under /api
// Our Next.js API routes handle authentication via cookies and proxy to the backend API.
import type { Incident, IncidentStats } from '@/types/incident';

export async function getIncidents(organizationId: string): Promise<Incident[]> {
  try {
    const response = await fetch(`/api/incidents/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`/api/incidents/stats/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Call our Next.js API route which proxies to backend with auth
    const response = await fetch(`/api/incidents/analytics/${encodeURIComponent(incidentId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Our Next.js API route expects PATCH at /api/incidents/analytics/[incidentId]
    const response = await fetch(`/api/incidents/analytics/${encodeURIComponent(incidentId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`/api/incidents/analytics/${encodeURIComponent(incidentId)}/updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`/api/incidents/analytics/${encodeURIComponent(incidentId)}/updates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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