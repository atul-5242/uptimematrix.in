'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { setAuthState } from '@/store/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for existing session on initial load
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Session response:', data);
          
          // If we have a token, set the auth state
          if (data.token) {
            store.dispatch(
              setAuthState({
                token: data.token,
                userId: data.user?.id || null,
                isAuthenticated: true
              })
            );
          } else {
            // If no token, ensure we're logged out
            store.dispatch(
              setAuthState({
                token: null,
                userId: null,
                isAuthenticated: false
              })
            );
          }
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      }
    }

    checkSession();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
