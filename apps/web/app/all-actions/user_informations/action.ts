
"use client";

import { apiRequest, handleApiError, handleApiSuccess } from '@/lib/errorHandler';

export interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  companies: string[];
  jobTitle?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
  isEmailVerified: boolean;
  organizations: {
    id: string;
    name: string;
    description: string;
    status: string;
    totalMembers: number;
    createdOn: string;
    industry?: string;
    location?: string;
    memberSince?: string;
    foundedYear?: number;
    about?: string;
    role: string;
    permissions: string[]; // Add permissions to the interface
  }[];
}

export async function fetchUserDetailsAction(organizationId?: string): Promise<UserData> {
  try {
    // Fetch token securely from the API route
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();
    
    if (!token) {
      handleApiError('Authentication required', 'Load User Details');
      throw new Error("Authentication token not found");
    }

    const result = await apiRequest('/api/user-data' + (organizationId ? `?organizationId=${organizationId}` : ''), {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    }, 'Load User Details');

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch user details");
    }

    return result.data;
  } catch (error) {
    if (!error.message.includes('Load User Details')) {
      handleApiError(error instanceof Error ? error.message : 'Failed to fetch user details', 'Load User Details');
    }
    throw error instanceof Error ? error : new Error('Failed to fetch user details');
  }
}
