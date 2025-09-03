'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { signOut } from '@/store/authSlice';

export default function SignOutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function handleSignOut() {
      try {
        // Call the signout API to clear the HTTP-only cookie
        await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error during sign out:', error);
      } finally {
        // Clear the client-side auth state
        dispatch(signOut());
        // Redirect to home page after sign out
        router.push('/');
      }
    }

    handleSignOut();
  }, [dispatch, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
        <p>Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
