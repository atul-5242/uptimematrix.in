'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { signInAction } from './actions';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<{email: string; password: string}>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<{email: string; password: string}>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const validateForm = (): boolean => {
    const errors: Partial<SignInFormData> = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await signInAction(dispatch, { 
        email: formData.email, 
        password: formData.password 
      });
      const redirect = searchParams.get('redirect');
      const target = redirect && redirect.startsWith('/') ? redirect : '/dashboard';
      router.replace(target);
    } catch (e) {
      // surface a simple error
      setValidationErrors({ email: 'Invalid credentials', password: 'Invalid credentials' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <style jsx>{`
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      
      <div className="w-full max-w-lg">
        {/* Logo/Brand */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-md opacity-30"></div>
            <img 
              src="https://pbs.twimg.com/profile_images/1971130228299718656/jODXiBTJ_400x400.jpg" 
              alt="UptimeMatrix Logo" 
              className="relative w-14 h-14 rounded-xl object-cover shadow-xl mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">Sign in to your account to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="glass-effect rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Global Error Display */}
            {(validationErrors.email === 'Invalid credentials' || validationErrors.password === 'Invalid credentials') && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg text-red-700 mb-4 shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <span className="text-sm font-medium">Invalid email or password. Please try again.</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                    validationErrors.email && validationErrors.email !== 'Invalid credentials' 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  placeholder="john.doe@example.com"
                  disabled={submitting}
                />
              </div>
              {validationErrors.email && validationErrors.email !== 'Invalid credentials' && (
                <p className="text-sm text-red-600 font-medium mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 ${
                    validationErrors.password && validationErrors.password !== 'Invalid credentials' 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  placeholder="Enter your password"
                  disabled={submitting}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors" 
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && validationErrors.password !== 'Invalid credentials' && (
                <p className="text-sm text-red-600 font-medium mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 underline decoration-blue-200 hover:decoration-blue-400"
                disabled={submitting}
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