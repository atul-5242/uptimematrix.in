"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  token: string | null;
  userId: string | null;
};

const initialState: AuthState = {
  token: null,
  userId: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("auth_userId");
      state.token = token ? token : null;
      state.userId = userId ? userId : null;
    },
    setCredentials(state, action: PayloadAction<{ token: string; userId?: string | null }>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId ?? null;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", action.payload.token);
        if (action.payload.userId) localStorage.setItem("auth_userId", action.payload.userId);
      }
    },
    signOut(state) {
      state.token = null;
      state.userId = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_userId");
      }
    },
  },
});

export const { setCredentials, signOut, hydrateFromStorage } = slice.actions;
export const authReducer = slice.reducer;
