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
    role: string;
  }[];
}

export async function fetchUserDetailsAction(): Promise<UserData> {
  const token = localStorage.getItem("auth_token");
  
  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch('/api/user-data', {
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
