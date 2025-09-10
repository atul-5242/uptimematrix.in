
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrganizationState {
  currentOrganizationId: string | null;
}

const initialState: OrganizationState = {
  currentOrganizationId: null,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setCurrentOrganizationId(
      state,
      action: PayloadAction<string | null>
    ) {
      state.currentOrganizationId = action.payload;
    },
  },
});

export const { setCurrentOrganizationId } = organizationSlice.actions;
export const organizationReducer = organizationSlice.reducer;
