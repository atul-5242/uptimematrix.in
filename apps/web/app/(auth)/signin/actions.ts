'use client';
import { AppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';

export async function signInAction(
  dispatch: AppDispatch,
  data: { email: string; password: string }
) {
  // Call app route to set httpOnly cookie
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Sign in failed');
  }
  const json = await res.json();
  const token: string = json?.jwt;
  // Backend doesn't return userId explicitly; JWT contains sub. You may decode if needed.
  dispatch(setCredentials({ token }));
  return token;
}
