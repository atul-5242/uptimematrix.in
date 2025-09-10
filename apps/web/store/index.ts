"use client";

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { authReducer } from './authSlice';
import userReducer from './userSlice';
import { organizationReducer } from './organizationSlice';
import { selectedOrganizationReducer } from './selectedOrganizationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    organization: organizationReducer,
    selectedOrganization: selectedOrganizationReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
