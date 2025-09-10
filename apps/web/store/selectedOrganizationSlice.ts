
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchOrganizationDetailsAction, deleteOrganizationAction, OrganizationDetailData } from '@/app/all-actions/organizations/actions';

interface SelectedOrganizationState {
  organization: OrganizationDetailData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SelectedOrganizationState = {
  organization: null,
  loading: false,
  error: null,
};

export const fetchSelectedOrganizationDetails = createAsyncThunk(
  'selectedOrganization/fetchDetails',
  async (organizationId: string, { rejectWithValue }) => {
    try {
      const data = await fetchOrganizationDetailsAction(organizationId);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch organization details'
      );
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  'selectedOrganization/delete',
  async (organizationId: string, { rejectWithValue }) => {
    try {
      await deleteOrganizationAction(organizationId);
      return organizationId; // Return the ID of the deleted organization
    } catch (error) {
      return rejectWithValue(
        error instanceof Error 
          ? error.message 
          : 'Failed to delete organization'
      );
    }
  }
);

const selectedOrganizationSlice = createSlice({
  name: "selectedOrganization",
  initialState,
  reducers: {
    clearSelectedOrganization: (state) => {
      state.organization = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSelectedOrganizationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSelectedOrganizationDetails.fulfilled, (state, action: PayloadAction<OrganizationDetailData>) => {
        state.loading = false;
        state.organization = action.payload;
      })
      .addCase(fetchSelectedOrganizationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.organization = null;
      })
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        // Clear the selected organization after successful deletion
        state.organization = null;
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedOrganization } = selectedOrganizationSlice.actions;
export const selectedOrganizationReducer = selectedOrganizationSlice.reducer;
