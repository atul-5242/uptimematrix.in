'use client';

import { api } from '@/lib/api';
import { AppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';

export async function signInAction(
  dispatch: AppDispatch,
  data: { username: string; password: string }
) {
  const res = await api.post('/auth/user/signin', data);
  const token: string = res.data?.jwt;
  // Backend doesn't return userId explicitly; JWT contains sub. You may decode if needed.
  dispatch(setCredentials({ token }));
  return token;
}
