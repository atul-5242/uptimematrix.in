'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpAction } from './actions';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  invitationEmails: string[];
  agreeToTerms: boolean;
}

type SignUpErrors = Partial<Record<keyof SignUpFormData, string>>;

const SignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    invitationEmails: [],
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

  const validateStep = (step: number): boolean => {
    const errors: SignUpErrors = {};

    if (step === 1) {
      // Personal Information
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.organizationName.trim()) errors.organizationName = 'Organization name is required';
      if (!formData.email) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    } else if (step === 2) {
      // Password Creation
      if (!formData.password) errors.password = 'Password is required';
      else if (!Object.values(passwordRequirements).every(Boolean)) errors.password = 'Password does not meet requirements';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    } else if (step === 3) {
      // Team Invitation & Terms
      const invalidEmails = formData.invitationEmails.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (invalidEmails.length > 0) {
        errors.invitationEmails = 'One or more invitation emails are invalid';
      }
      if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await signUpAction({
        fullName: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
        invitationEmails: formData.invitationEmails,
      });
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

  const handleInvitationEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const email = (e.target as HTMLInputElement).value.trim();
      if (email && !formData.invitationEmails.includes(email)) {
        setFormData(prev => ({ ...prev, invitationEmails: [...prev.invitationEmails, email] }));
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const handleInvitationEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = (e.target as HTMLInputElement).value.trim();
    if (email && !formData.invitationEmails.includes(email)) {
      setFormData(prev => ({ ...prev, invitationEmails: [...prev.invitationEmails, email] }));
    }
  };

  const handleRemoveInvitationEmail = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      invitationEmails: prev.invitationEmails.filter(email => email !== emailToRemove)
    }));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Create Password';
      case 3: return 'Invite Team & Complete';
      default: return 'Create Account';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Tell us about yourself and your organization';
      case 2: return 'Secure your account with a strong password';
      case 3: return 'Invite your team and finish setup';
      default: return 'Get started with your free account today';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <img 
            src="https://pbs.twimg.com/profile_images/1971130228299718656/jODXiBTJ_400x400.jpg" 
            alt="UptimeMatrix Logo" 
            className="w-16 h-16 rounded-xl mb-4 object-cover scale-125 shadow-lg mx-auto"
          />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{getStepTitle()}</h1>
          <p className="text-slate-600">{getStepDescription()}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-slate-500">
            Step {currentStep} of 3
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Global Error */}
            {apiError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
                <AlertCircle size={20} />
                <span className="text-sm">{apiError}</span>
              </div>
            )}

            {/* Step Content with Animation */}
            <div>
              {currentStep === 1 && (
                <div className="animate-fadeIn space-y-6">

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          id="firstName" 
                          type="text" 
                          value={formData.firstName} 
                          onChange={handleChange('firstName')} 
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                          placeholder="John" 
                        />
                      </div>
                      {validationErrors.firstName && (<p className="text-sm text-red-600">{validationErrors.firstName}</p>)}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          id="lastName" 
                          type="text" 
                          value={formData.lastName} 
                          onChange={handleChange('lastName')} 
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.lastName ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                          placeholder="Doe" 
                        />
                      </div>
                      {validationErrors.lastName && (<p className="text-sm text-red-600">{validationErrors.lastName}</p>)}
                    </div>
                  </div>

                  {/* Organization Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="organizationName" className="block text-sm font-medium text-slate-700">Organization Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="h-5 w-5 text-slate-400">🏢</span>
                      </div>
                      <input 
                        id="organizationName" 
                        type="text" 
                        value={formData.organizationName} 
                        onChange={handleChange('organizationName')} 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.organizationName ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                        placeholder="TechSolutions Inc." 
                      />
                    </div>
                    {validationErrors.organizationName && (<p className="text-sm text-red-600">{validationErrors.organizationName}</p>)}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange('email')} 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg ${validationErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                        placeholder="john.doe@example.com" 
                      />
                    </div>
                    {validationErrors.email && (<p className="text-sm text-red-600">{validationErrors.email}</p>)}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fadeIn space-y-6">
                  {/* Password Field */}
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
                        placeholder="Create a strong password" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {validationErrors.password && (<p className="text-sm text-red-600">{validationErrors.password}</p>)}
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">Password must contain:</p>
                    <div className="space-y-1">
                      {Object.entries({
                        length: 'At least 8 characters',
                        uppercase: 'One uppercase letter',
                        lowercase: 'One lowercase letter',
                        number: 'One number',
                        special: 'One special character'
                      }).map(([key, label]) => (
                        <div key={key} className={`flex items-center gap-2 text-sm ${passwordRequirements[key as keyof typeof passwordRequirements] ? 'text-green-600' : 'text-slate-500'}`}>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordRequirements[key as keyof typeof passwordRequirements] ? 'bg-green-100' : 'bg-slate-100'}`}>
                            {passwordRequirements[key as keyof typeof passwordRequirements] && <Check size={12} />}
                          </div>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={formData.confirmPassword} 
                        onChange={handleChange('confirmPassword')} 
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg ${validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                        placeholder="Confirm your password" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (<p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>)}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fadeIn space-y-6">
                  {/* Invitation Emails Field */}
                  <div className="space-y-2">
                    <label htmlFor="invitationEmails" className="block text-sm font-medium text-slate-700">Invite Team Members (Optional)</label>
                    <div className="relative">
                      <input
                        id="invitationEmailInput"
                        type="email"
                        className={`w-full pr-4 py-3 border rounded-lg ${validationErrors.invitationEmails ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white hover:border-slate-400'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter email and press Enter or Tab"
                        onKeyDown={handleInvitationEmailKeyDown}
                        onBlur={handleInvitationEmailBlur}
                      />
                    </div>
                    {formData.invitationEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.invitationEmails.map((email, index) => (
                          <span key={email} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {email}
                            <button type="button" onClick={() => handleRemoveInvitationEmail(email)} className="text-blue-600 hover:text-blue-800">
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {validationErrors.invitationEmails && (<p className="text-sm text-red-600">{validationErrors.invitationEmails}</p>)}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.agreeToTerms} 
                        onChange={handleChange('agreeToTerms')} 
                        className="mt-0.5 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
                      />
                      <span className="text-sm text-slate-600">
                        I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
                      </span>
                    </label>
                    {validationErrors.agreeToTerms && (<p className="text-sm text-red-600">{validationErrors.agreeToTerms}</p>)}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 mt-4">
              <div className="flex justify-between items-center">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => router.push('/signin')} 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
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