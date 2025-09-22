"use client";

import { toast } from "@/hooks/use-toast";
import { Incident, IncidentStats } from "@/types/incident";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Get the token from localStorage
    let token = '';
    if (typeof window !== 'undefined') {
      // Check for both 'auth_token' and 'token' for backward compatibility
      token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      console.log('Using token from localStorage:', token ? '*****' + token.slice(-5) : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
    }

    console.log(`Making request to: ${url}`);
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Error response:', errorData);
      } catch (e) {
        errorData = { message: 'Failed to parse error response' };
      }
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchWithAuth:', error);
    throw error;
  }
}

export async function getIncidents(organizationId: string): Promise<Incident[]> {
  try {
    const data = await fetchWithAuth(
      `${API_BASE_URL}/api/incidents/${organizationId}`
    );
    return data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch incidents',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function getIncidentStats(organizationId: string): Promise<IncidentStats> {
  try {
    const data = await fetchWithAuth(
      `${API_BASE_URL}/api/incidents/stats/${organizationId}`
    );
    return data;
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch incident statistics',
      variant: 'destructive',
    });
    throw error;
  }
}

// Incident Analytics Functions
export async function getIncidentAnalytics(incidentId: string) {
  try {
    const response = await fetch(`/api/incidents/analytics/${incidentId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch incident analytics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching incident analytics:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch incident analytics',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function updateIncidentStatus(incidentId: string, status: string) {
  try {
    const response = await fetch(`/api/incidents/analytics/${incidentId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update incident status');
    }

    const data = await response.json();
    toast({
      title: 'Success',
      description: 'Incident status updated successfully',
    });
    return data;
  } catch (error) {
    console.error('Error updating incident status:', error);
    toast({
      title: 'Error',
      description: 'Failed to update incident status',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function createIncidentUpdate(incidentId: string, message: string, type: 'comment' | 'incident_report') {
  try {
    const response = await fetch(`/api/incidents/analytics/${incidentId}/updates`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, type }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create incident update');
    }

    const data = await response.json();
    toast({
      title: 'Success',
      description: 'Update posted successfully',
    });
    return data;
  } catch (error) {
    console.error('Error creating incident update:', error);
    toast({
      title: 'Error',
      description: 'Failed to post update',
      variant: 'destructive',
    });
    throw error;
  }
}

export async function getIncidentUpdates(incidentId: string) {
  try {
    const response = await fetch(`/api/incidents/analytics/${incidentId}/updates`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch incident updates');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching incident updates:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch incident updates',
      variant: 'destructive',
    });
    throw error;
  }
}
