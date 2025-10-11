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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .step-indicator {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">{getStepTitle()}</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">{getStepDescription()}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`step-indicator w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-200' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}>
                  {step < currentStep ? <Check size={14} className="text-white" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                    step < currentStep 
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                      : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
              Step {currentStep} of 3
            </span>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="glass-effect rounded-2xl shadow-xl p-6">
          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Global Error */}
            {apiError && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg text-red-700 mb-4 shadow-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <span className="text-sm font-medium">{apiError}</span>
              </div>
            )}

            {/* Step Content with Animation */}
            <div>
              {currentStep === 1 && (
                <div className="animate-fadeIn space-y-4">

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          id="firstName" 
                          type="text" 
                          value={formData.firstName} 
                          onChange={handleChange('firstName')} 
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.firstName ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`} 
                          placeholder="John" 
                        />
                      </div>
                          {validationErrors.firstName && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.firstName}</p>)}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          id="lastName" 
                          type="text" 
                          value={formData.lastName} 
                          onChange={handleChange('lastName')} 
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.lastName ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`} 
                          placeholder="Doe" 
                        />
                      </div>
                      {validationErrors.lastName && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.lastName}</p>)}
                    </div>
                  </div>

                  {/* Organization Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="organizationName" className="block text-sm font-semibold text-slate-700 mb-2">Organization Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="h-5 w-5 text-slate-400">🏢</span>
                      </div>
                      <input 
                        id="organizationName" 
                        type="text" 
                        value={formData.organizationName} 
                        onChange={handleChange('organizationName')} 
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.organizationName ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`} 
                        placeholder="TechSolutions Inc." 
                      />
                    </div>
                    {validationErrors.organizationName && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.organizationName}</p>)}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        id="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange('email')} 
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.email ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`} 
                        placeholder="john.doe@example.com" 
                      />
                    </div>
                    {validationErrors.email && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.email}</p>)}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fadeIn space-y-4">
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
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.password ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`} 
                        placeholder="Create a strong password" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {validationErrors.password && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.password}</p>)}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries({
                        length: '8+ chars',
                        uppercase: 'Uppercase',
                        lowercase: 'Lowercase', 
                        number: 'Number',
                        special: 'Special char'
                      }).map(([key, label]) => (
                        <div key={key} className={`flex items-center gap-2 text-xs transition-all duration-200 ${passwordRequirements[key as keyof typeof passwordRequirements] ? 'text-green-700' : 'text-slate-500'}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200 ${passwordRequirements[key as keyof typeof passwordRequirements] ? 'bg-green-100 border border-green-300' : 'bg-slate-200 border border-slate-300'}`}>
                            {passwordRequirements[key as keyof typeof passwordRequirements] && <Check size={8} className="text-green-600" />}
                          </div>
                          <span className="font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">Confirm password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={formData.confirmPassword} 
                        onChange={handleChange('confirmPassword')} 
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.confirmPassword ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`} 
                        placeholder="Confirm your password" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.confirmPassword}</p>)}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fadeIn space-y-4">
                  {/* Invitation Emails Field */}
                  <div className="space-y-2">
                    <label htmlFor="invitationEmails" className="block text-sm font-semibold text-slate-700 mb-2">Invite Team Members (Optional)</label>
                    <div className="relative">
                      <input
                        id="invitationEmailInput"
                        type="email"
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 ${validationErrors.invitationEmails ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
                        placeholder="Enter email and press Enter"
                        onKeyDown={handleInvitationEmailKeyDown}
                        onBlur={handleInvitationEmailBlur}
                      />
                    </div>
                    {formData.invitationEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.invitationEmails.map((email, index) => (
                          <span key={email} className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200 shadow-sm">
                            {email}
                            <button type="button" onClick={() => handleRemoveInvitationEmail(email)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors text-xs">
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {validationErrors.invitationEmails && (<p className="text-sm text-red-600 font-medium mt-1">{validationErrors.invitationEmails}</p>)}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.agreeToTerms} 
                        onChange={handleChange('agreeToTerms')} 
                        className="mt-0.5 h-4 w-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-blue-100" 
                      />
                      <span className="text-sm text-slate-700 leading-relaxed">
                        I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-blue-200 hover:decoration-blue-400 transition-colors">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-blue-200 hover:decoration-blue-400 transition-colors">Privacy Policy</a>
                      </span>
                    </label>
                    {validationErrors.agreeToTerms && (<p className="text-sm text-red-600 font-medium mt-2">{validationErrors.agreeToTerms}</p>)}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 mt-3">
              <div className="flex justify-between items-center">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold rounded-lg hover:bg-slate-100 transition-all duration-200"
                  >
                    <ArrowLeft size={18} />
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Next
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => router.push('/signin')} 
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 underline decoration-blue-200 hover:decoration-blue-400"
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