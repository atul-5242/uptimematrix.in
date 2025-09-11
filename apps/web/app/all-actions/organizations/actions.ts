
"use client";

// import { cookies } from "next/headers";

export interface MemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  initials: string;
}

export interface OrganizationDetailData {
  id: string;
  name: string;
  description: string;
  status: string;
  totalMembers: number;
  createdOn: string | null | undefined;
  industry?: string;
  location?: string;
  memberSince?: string;
  foundedYear?: number;
  about?: string;
  members: MemberData[];
  role: string;
  permissions: string[];
}

export async function fetchOrganizationDetailsAction(organizationId: string): Promise<OrganizationDetailData> {
  // Fetch token securely from the API route
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(`/api/organizations/${organizationId}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch organization details");
  }

  return await response.json();
}

export async function deleteOrganizationAction(organizationId: string): Promise<{ success: boolean; message: string; }> {
  const tokenResponse = await fetch('/api/auth/get-token');
  const { token } = await tokenResponse.json();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(`/api/organizations/${organizationId}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete organization");
  }

  return { success: true, message: "Organization deleted successfully" };
}
