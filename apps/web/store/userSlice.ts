"use client"

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserDetailsAction, UserData } from '@/app/all-actions/user_informations/action';

const initialState: UserData = {
  id: '',
  fullName: 'User',
  email: '',
  phone: undefined,
  companies: [],
  jobTitle: undefined,
  location: undefined,
  bio: undefined,
  avatar: undefined,
  joinDate: new Date().toISOString(),
  lastLogin: undefined,
  isEmailVerified: false,
  organizations: []
};

export const fetchUserDetails = createAsyncThunk(
  'user/fetchDetails',
  async (organizationId: string | undefined, { rejectWithValue }) => {
    try {
      const data = await fetchUserDetailsAction(organizationId);
      console.log('User details fetched:', data);
      return data;
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
      .addCase(fetchUserDetails.fulfilled, (_, action) => action.payload)
      .addCase(fetchUserDetails.rejected, (state, action) => {
        console.error('User details fetch failed:', action.payload);
        return initialState;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
