'use server';

import { Incident, IncidentStats } from '@/types/incident';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch data');
  }

  return response.json();
}

export async function getIncidents(organizationId: string): Promise<Incident[]> {
  try {
    const data = await fetchWithAuth(
      `${API_BASE_URL}/api/incidents/${organizationId}`
    );
    return data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
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
    throw error;
  }
}
