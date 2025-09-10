'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { setAuthState } from '@/store/authSlice';

export function Providers({ 
  children,
  initialToken,
  initialUserId
}: { 
  children: React.ReactNode;
  initialToken?: string | null;
  initialUserId?: string | null;
}) {
  useEffect(() => {
    if (initialToken && initialUserId) {
      store.dispatch(
        setAuthState({
          token: initialToken,
          userId: initialUserId,
          isAuthenticated: true,
        })
      );
    }
  }, [initialToken, initialUserId]);

  return <Provider store={store}>{children}</Provider>;
}
