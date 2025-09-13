
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from '@/hooks/use-toast'; // Corrected import path
// import axios from 'axios'; // Remove axios import

// I dont think this file is used or usefull okay.

interface OrganizationState {
  currentOrganizationId: string | null;
  selectedOrganizationRole: string | null;
  selectedOrganizationPermissions: string[];
}

const initialState: OrganizationState = {
  currentOrganizationId: null,
  selectedOrganizationRole: null,
  selectedOrganizationPermissions: [],
};

export const setSelectedOrganization = createAsyncThunk(
  'organization/setSelectedOrganization',
  async (
    { organizationId }: { organizationId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        '/api/auth/select-organization', // Your new API endpoint
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ organizationId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Failed to set selected organization',
          description: errorData.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
        return rejectWithValue(errorData.message);
      }

      return await response.json(); // You might want to return the updated user data or just a success message
    } catch (error) {
      toast({
        title: 'Failed to set selected organization',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return rejectWithValue('An unexpected error occurred.');
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setCurrentOrganizationId: (state, action: PayloadAction<string>) => {
      state.currentOrganizationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setSelectedOrganization.fulfilled, (state, action) => {
        state.currentOrganizationId = action.meta.arg.organizationId;
        // Role and permissions will be updated via fetchUserDetails which is dispatched after this.
      })
      .addCase(setSelectedOrganization.rejected, (state, action) => {
        // Handle error if needed
        console.error("Failed to set selected organization:", action.payload);
      });
  },
});

export const { setCurrentOrganizationId } = organizationSlice.actions;
export const organizationReducer = organizationSlice.reducer;
