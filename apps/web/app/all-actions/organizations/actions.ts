
"use client";

import { fetchUserDetails } from "@/store/userSlice";
import { setSelectedOrganization } from "@/store/organizationSlice";
import { toast } from "@/hooks/use-toast";

export interface MemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  initials: string;
  isVerified: boolean;
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

// New action to select an organization and sync user details
export async function selectAndSyncOrganization(organizationId: string, dispatch: any) {
  try {
    // 1. Update frontend state immediately with the selected organization
    dispatch(setSelectedOrganization({ organizationId: organizationId }));

    // Fetch token securely from the API route
    const tokenResponse = await fetch('/api/auth/get-token');
    const { token } = await tokenResponse.json();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    // 2. Call the frontend Next.js API route to update backend
    const response = await fetch('/api/userprofile/selectorganization-updation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ organizationId: organizationId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Action] Failed to update selected organization on frontend API:', errorData);
      // You might want to revert the setSelectedOrganization dispatch here if the backend update fails
      throw new Error(errorData.message || 'Failed to update selected organization');
    }

    // 3. Only if the backend update is successful, then dispatch fetchUserDetails() to re-sync full user data
    dispatch(fetchUserDetails());

    toast({
      title: 'Organization Selected',
      description: 'Your selected organization has been updated.',
    });

  } catch (error: any) {
    console.error('[Action] Error during organization selection:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to select organization.',
      variant: 'destructive',
    });
  }
}
