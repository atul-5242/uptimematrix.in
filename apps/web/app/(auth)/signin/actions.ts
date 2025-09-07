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
  
  console.log("token comes from here okay please check it be sure that token come okay",token);

  
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
  
  if (typeof document !== "undefined") {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
  
    let cookie = `auth_token=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax;`;
  
    if (process.env.NODE_ENV === "production") {
      cookie += " Secure;";
    }
  
    document.cookie = cookie;
  }
  
  
  // Update auth state
  dispatch(setAuthState({
    token,
    userId: user?.id || null,
    isAuthenticated: true
  }));

  return token;
}
