"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  token: null,
  userId: null,
  isAuthenticated: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<{ token: string | null; userId: string | null; isAuthenticated: boolean }>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    signOut(state) {
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthState, signOut } = slice.actions;
export const authReducer = slice.reducer;
