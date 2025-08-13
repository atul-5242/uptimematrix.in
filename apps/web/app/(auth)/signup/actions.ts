'use client';

import { api } from '@/lib/api';

export async function signUpAction(data: { username: string; password: string }) {
  try {
    console.log('[WEB] POST /auth/user/signup', { baseURL: api.defaults.baseURL, username: data.username });
    const res = await api.post('/auth/user/signup', data);
    console.log('[WEB] /auth/user/signup response', res.status, res.data);
    return res.data;
  } catch (e: any) {
    console.error('[WEB] /auth/user/signup error', e?.response?.status, e?.response?.data || e?.message);
    const msg = e?.response?.data?.message || 'Sign up failed';
    throw new Error(msg);
  }
}
