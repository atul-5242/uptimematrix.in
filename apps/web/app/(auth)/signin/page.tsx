'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { signInAction } from './actions';

interface SignInFormData {
  username: string;
  password: string;
}

interface SignInProps {
  onSubmit?: (data: SignInFormData) => Promise<void> | void;
  onSignUpClick?: () => void;
  isLoading?: boolean;
  error?: string;
}

const SignIn: React.FC<SignInProps> = ({ onSubmit, onSignUpClick, isLoading = false, error }) => {
  const [formData, setFormData] = useState<SignInFormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<SignInFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const validateForm = (): boolean => {
    const errors: Partial<SignInFormData> = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await signInAction(dispatch, { username: formData.username, password: formData.password });
      const redirect = searchParams.get('redirect');
      const target = redirect && redirect.startsWith('/') ? redirect : '/dashboard';
      router.replace(target);
    } catch (e) {
      // surface a simple error
      setValidationErrors({ username: 'Invalid credentials', password: 'Invalid credentials' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-600">Sign in to your account to continue</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange('username')}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.username ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your username"
                  disabled={isLoading || submitting}
                />
              </div>
              {validationErrors.username && <p className="text-sm text-red-600">{validationErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter your password"
                  disabled={isLoading || submitting}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600" disabled={isLoading || submitting}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
            </div>
            <button type="submit" disabled={isLoading || submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing in...</>) : 'Sign in'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                disabled={isLoading || submitting}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;