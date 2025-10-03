import { toast } from '@/hooks/use-toast';

export class ApiError extends Error {
  status: number;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * apiFetch: fetch wrapper that surfaces 401/403 with user-friendly notifications
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    let body: any = undefined;
    try { body = await res.json(); } catch { /* ignore */ }

    const message = body?.message || body?.error || res.statusText || 'Request failed';

    if (res.status === 401) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to continue.',
        variant: 'destructive',
      });
      throw new ApiError(message, 401, body);
    }
    if (res.status === 403) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive',
      });
      throw new ApiError(message, 403, body);
    }

    toast({
      title: 'Server error',
      description: message,
      variant: 'destructive',
    });
    throw new ApiError(message, res.status, body);
  }
  return res;
}
