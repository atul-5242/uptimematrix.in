'use client';
import { AppDispatch } from '@/store';
import { setAuthState } from '@/store/authSlice';

export async function signInAction(
  dispatch: AppDispatch,
  data: { email: string; password: string }
) {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password
    }),
    credentials: 'include', // Important for cookies
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Sign in failed');
  }

  const { user, token } = await res.json();
  
  // Update auth state
  dispatch(setAuthState({
    token,
    userId: user?.id || null,
    isAuthenticated: true
  }));

  return token;
}
