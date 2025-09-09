'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InvitationData {
  email: string;
  organizationName: string;
  inviterName: string;
  role: string;
  userExists?: boolean;
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'loading' | 'confirm' | 'password' | 'success' | 'error'>('loading');
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStep('error');
      setError('Invalid invitation link. No token provided.');
      return;
    }

    // Verify invitation token
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const response = await fetch('/api/auth/verify-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setInvitationData(data.invitation);
        setStep('confirm');
      } else {
        setStep('error');
        setError(data.message || 'Invalid or expired invitation link.');
      }
    } catch (error) {
      setStep('error');
      setError('Failed to verify invitation. Please try again.');
    }
  };

  const handleConfirmInvitation = () => {
    // If user exists, they can join directly without setting a password
    if (invitationData?.userExists) {
      handleAcceptInvitationForExistingUser();
    } else {
      setStep('password');
    }
  };

  const handleAcceptInvitationForExistingUser = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          // No password or fullName needed for existing users
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to accept invitation. Please try again.');
      }
    } catch (error) {
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          fullName: fullName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to accept invitation. Please try again.');
      }
    } catch (error) {
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/signin')} 
              className="w-full mt-4"
              variant="outline"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Welcome!</CardTitle>
            <CardDescription>
              You have successfully joined {invitationData?.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              Redirecting you to the dashboard...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>You're Invited!</CardTitle>
            <CardDescription>
              {invitationData?.inviterName} has invited you to join{' '}
              <strong>{invitationData?.organizationName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {invitationData?.email}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Role:</strong> {invitationData?.role}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleConfirmInvitation}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {invitationData?.userExists ? 'Joining Organization...' : 'Continue'}
                  </>
                ) : (
                  invitationData?.userExists ? 'Join Organization' : 'Accept Invitation'
                )}
              </Button>
              <Button 
                onClick={() => router.push('/signin')}
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
              >
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Account</CardTitle>
            <CardDescription>
              Set up your password to join {invitationData?.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
                
                <Button 
                  type="button"
                  onClick={() => setStep('confirm')}
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
