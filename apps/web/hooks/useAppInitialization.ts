"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUserDetails } from '../store/userSlice';
import { setCurrentOrganizationId } from '../store/organizationSlice';

export const useAppInitialization = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { loading: userLoading, id: userId, selectedOrganizationId } = useAppSelector(state => state.user);
  const { currentOrganizationId } = useAppSelector(state => state.organization);

  useEffect(() => {
    // Only initialize if user is authenticated and we haven't loaded user data yet
    if (isAuthenticated && !userId && !userLoading) {
      dispatch(fetchUserDetails());
    }
  }, [isAuthenticated, userId, userLoading, dispatch]);

  useEffect(() => {
    // Set current organization ID from user data if not already set
    if (selectedOrganizationId && !currentOrganizationId) {
      dispatch(setCurrentOrganizationId(selectedOrganizationId));
    }
  }, [selectedOrganizationId, currentOrganizationId, dispatch]);

  return {
    isInitialized: isAuthenticated && !!userId && !userLoading,
    isLoading: userLoading
  };
};
