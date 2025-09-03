'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setAuthState } from '@/store/authSlice';

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        const data = await res.json();
        
        dispatch(setAuthState({
          token: data.token || null,
          userId: data.user?.id || null,
          isAuthenticated: data.isAuthenticated || false
        }));

        if (requireAuth && !data.isAuthenticated) {
          router.push('/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          router.push('/signin');
        }
      }
    }

    checkAuth();
  }, [dispatch, requireAuth, router]);

  return { isAuthenticated };
}
