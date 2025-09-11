
"use client";

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
  // Fetch token securely from the API route
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();
  
  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch('/api/user-data' + (organizationId ? `?organizationId=${organizationId}` : ''), {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Send token in Authorization header
    },
    cache: 'no-store'
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch user details");
  }

  return await response.json();
}
