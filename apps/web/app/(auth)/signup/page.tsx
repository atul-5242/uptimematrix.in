'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpAction } from './actions';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface SignUpProps {
  onSubmit?: (data: Omit<SignUpFormData, 'confirmPassword'>) => Promise<void> | void;
  onSignInClick?: () => void;
  isLoading?: boolean;
  error?: string;
}

type SignUpErrors = Partial<Record<keyof SignUpFormData, string>>;

const SignUp: React.FC<SignUpProps> = ({ onSubmit, onSignInClick, isLoading = false, error }) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<SignUpErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);

  const validateForm = (): boolean => {
    const errors: SignUpErrors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';

    if (!formData.password) errors.password = 'Password is required';
    else if (!Object.values(passwordRequirements).every(Boolean)) errors.password = 'Password does not meet requirements';

    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      // Backend expects { fullName, email, password }
      await signUpAction({
        fullName: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        password: formData.password
      });
      if (onSubmit) await onSubmit({ ...formData });
      router.push('/signin');
    } catch (e: any) {
      setApiError(e?.message || 'Sign up failed. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'agreeToTerms' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-600">Get started with your free account today</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {(error || apiError) && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{apiError || error}</span>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input id="firstName" type="text" value={formData.firstName} onChange={handleChange('firstName')} className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="John" disabled={isLoading || submitting} />
                </div>
                {validationErrors.firstName && (<p className="text-sm text-red-600">{validationErrors.firstName}</p>)}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input id="lastName" type="text" value={formData.lastName} onChange={handleChange('lastName')} className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.lastName ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Doe" disabled={isLoading || submitting} />
                </div>
                {validationErrors.lastName && (<p className="text-sm text-red-600">{validationErrors.lastName}</p>)}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input id="email" type="email" value={formData.email} onChange={handleChange('email')} className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="john.doe@example.com" disabled={isLoading || submitting} />
              </div>
              {validationErrors.email && (<p className="text-sm text-red-600">{validationErrors.email}</p>)}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange('password')} className={`w-full pl-10 pr-12 py-3 border rounded-lg ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Create a strong password" disabled={isLoading || submitting} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600" disabled={isLoading || submitting}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              {validationErrors.password && (<p className="text-sm text-red-600">{validationErrors.password}</p>)}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange('confirmPassword')} className={`w-full pl-10 pr-12 py-3 border rounded-lg ${validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} placeholder="Confirm your password" disabled={isLoading || submitting} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600" disabled={isLoading || submitting}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              {validationErrors.confirmPassword && (<p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>)}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.agreeToTerms} onChange={handleChange('agreeToTerms')} className="mt-0.5 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" disabled={isLoading || submitting} />
                <span className="text-sm text-slate-600">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
                </span>
              </label>
              {validationErrors.agreeToTerms && (<p className="text-sm text-red-600">{validationErrors.agreeToTerms}</p>)}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading || submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating account...</>) : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-slate-300"></div>
            <div className="px-4 text-sm text-slate-500">or</div>
            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button type="button" onClick={() => router.push('/signin')} className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200" disabled={isLoading || submitting}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;