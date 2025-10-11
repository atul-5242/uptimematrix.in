'use client';

import { toast } from '@/hooks/use-toast';

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/**
 * Centralized error handler for API responses
 * Shows appropriate notifications for different types of errors
 */
export function handleApiError(error: ApiError | string, context?: string) {
  const errorMessage = typeof error === 'string' ? error : error.error || error.message || 'An unknown error occurred';
  const status = typeof error === 'object' ? error.status : undefined;
  
  let title = 'Error';
  let description = errorMessage;
  let variant: 'default' | 'destructive' = 'destructive';

  // Handle specific HTTP status codes
  switch (status) {
    case 401:
      title = 'Authentication Required';
      description = 'You need to sign in to perform this action.';
      break;
    case 403:
      title = 'Permission Denied';
      description = 'You don\'t have permission to perform this action. Please contact your administrator if you believe this is an error.';
      break;
    case 404:
      title = 'Not Found';
      description = 'The requested resource was not found.';
      break;
    case 429:
      title = 'Too Many Requests';
      description = 'You\'re making too many requests. Please wait a moment and try again.';
      break;
    case 500:
      title = 'Server Error';
      description = 'An internal server error occurred. Please try again later.';
      break;
    case 502:
    case 503:
    case 504:
      title = 'Service Unavailable';
      description = 'The service is temporarily unavailable. Please try again later.';
      break;
    default:
      // Check for specific error messages that indicate permission issues
      if (errorMessage.toLowerCase().includes('permission') || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('forbidden') ||
          errorMessage.toLowerCase().includes('access denied')) {
        title = 'Permission Denied';
        description = 'You don\'t have permission to perform this action. Please contact your administrator.';
      } else if (errorMessage.toLowerCase().includes('network') ||
                 errorMessage.toLowerCase().includes('connection')) {
        title = 'Network Error';
        description = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      break;
  }

  // Add context if provided
  if (context) {
    description = `${context}: ${description}`;
  }

  // Show the toast notification
  toast({
    variant,
    title,
    description,
  });

  // Log the error for debugging
  console.error('API Error:', { error, context, status });
}

/**
 * Handle successful API responses with optional success notification
 */
export function handleApiSuccess(message?: string, context?: string) {
  if (message) {
    let description = message;
    if (context) {
      description = `${context}: ${message}`;
    }
    
    toast({
      variant: 'default',
      title: 'Success',
      description,
    });
  }
}

/**
 * Enhanced fetch wrapper that automatically handles errors and shows notifications
 */
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {},
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      credentials: 'include', // Important for authentication cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error: ApiError = {
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        message: data.message,
        status: response.status,
        details: data,
      };

      handleApiError(error, context);
      
      return {
        success: false,
        error: error.error,
        message: error.message,
        status: error.status,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error: any) {
    const apiError: ApiError = {
      error: error.message || 'Network error occurred',
      status: 0,
    };

    handleApiError(apiError, context);
    
    return {
      success: false,
      error: apiError.error,
    };
  }
}

/**
 * Process API response and handle errors automatically
 */
export function processApiResponse<T = any>(
  response: ApiResponse<T>,
  context?: string,
  showSuccessMessage?: boolean
): ApiResponse<T> {
  if (!response.success && response.error) {
    handleApiError({
      error: response.error,
      message: response.message,
      status: response.status,
    }, context);
  } else if (response.success && showSuccessMessage && response.message) {
    handleApiSuccess(response.message, context);
  }

  return response;
}