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

// Add more incident-related actions here as needed
