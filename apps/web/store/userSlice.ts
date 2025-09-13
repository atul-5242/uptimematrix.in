"use client"

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserDetailsAction, UserData } from '@/app/all-actions/user_informations/action';
// import axios from 'axios'; // Remove axios import
import { PayloadAction } from '@reduxjs/toolkit';

interface Organization {
  id: string;
  name: string;
  description: string;
  status: string;
  totalMembers: number;
  createdOn: string | undefined;
  industry?: string;
  location?: string;
  memberSince?: string;
  foundedYear?: number;
  about?: string;
  role: string;
  permissions: string[];
}

interface UserDetailsPayload {
  id: string | null;
  fullName: string;
  email: string;
  phone: number | undefined;
  jobTitle: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  avatar: string | undefined;
  joinDate: string;
  lastLogin: string | undefined;
  isEmailVerified: boolean;
  selectedOrganizationId: string | null;
  selectedOrganizationRole: string | null;
  selectedOrganizationPermissions: string[];
  organizations: Organization[];
}

interface UserState extends UserDetailsPayload {
  loading: boolean;
}

const initialState: UserState = {
  id: null,
  fullName: 'User',
  email: '',
  phone: undefined,
  jobTitle: undefined,
  location: undefined,
  bio: undefined,
  avatar: undefined,
  joinDate: new Date().toISOString(),
  lastLogin: undefined,
  isEmailVerified: false,
  selectedOrganizationId: null,
  selectedOrganizationRole: null,
  selectedOrganizationPermissions: [],
  organizations: [{
    id: '',
    name: 'Default Organization',
    description: '',
    status: '',
    totalMembers: 0,
    createdOn: new Date().toISOString(),
    role: '',
    permissions: [],
  }],
  loading: true,
};

export const fetchUserDetails = createAsyncThunk(
  'user/fetchDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/userprofile/me');
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch user details');
      }
      const data = await response.json();
      const { id, fullName, email, phone, jobTitle, location, bio, avatar, joinDate, lastLogin, isEmailVerified, selectedOrganizationId, selectedOrganizationRole, selectedOrganizationPermissions, organizations } = data;
      return { id, fullName, email, phone, jobTitle, location, bio, avatar, joinDate, lastLogin, isEmailVerified, selectedOrganizationId, selectedOrganizationRole, selectedOrganizationPermissions, organizations };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch user details'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<UserDetailsPayload>) => {
        state.loading = false;
        state.id = action.payload.id;
        state.fullName = action.payload.fullName;
        state.email = action.payload.email;
        state.phone = action.payload.phone;
        state.jobTitle = action.payload.jobTitle;
        state.location = action.payload.location;
        state.bio = action.payload.bio;
        state.avatar = action.payload.avatar;
        state.joinDate = action.payload.joinDate;
        state.lastLogin = action.payload.lastLogin;
        state.isEmailVerified = action.payload.isEmailVerified;
        state.selectedOrganizationId = action.payload.selectedOrganizationId;
        state.selectedOrganizationRole = action.payload.selectedOrganizationRole;
        state.selectedOrganizationPermissions = action.payload.selectedOrganizationPermissions;
        state.organizations = action.payload.organizations;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        console.error('User details fetch failed:', action.payload);
        // Reset state properties instead of returning new object
        state.id = null;
        state.fullName = 'User';
        state.email = '';
        state.phone = undefined;
        state.jobTitle = undefined;
        state.location = undefined;
        state.bio = undefined;
        state.avatar = undefined;
        state.joinDate = new Date().toISOString();
        state.lastLogin = undefined;
        state.isEmailVerified = false;
        state.selectedOrganizationId = null;
        state.selectedOrganizationRole = null;
        state.selectedOrganizationPermissions = [];
        state.organizations = [{
          id: '',
          name: 'Default Organization',
          description: '',
          status: '',
          totalMembers: 0,
          createdOn: new Date().toISOString(),
          role: '',
          permissions: [],
        }];
      });
  }
});

export const { clearUserData } = userSlice.actions;
export const userReducer = userSlice.reducer;
