'use client';

import { api } from '@/lib/api';

export async function signUpAction(data: { username: string; password: string }) {
  try {
    console.log('[WEB] POST /user/signup', { baseURL: api.defaults.baseURL, username: data.username });
    const res = await api.post('/user/signup', data);
    console.log('[WEB] /user/signup response', res.status, res.data);
    return res.data;
  } catch (e: any) {
    console.error('[WEB] /user/signup error', e?.response?.status, e?.response?.data || e?.message);
    const msg = e?.response?.data?.message || 'Sign up failed';
    throw new Error(msg);
  }
}
