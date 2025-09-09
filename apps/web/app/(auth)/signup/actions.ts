'use client';

export async function signUpAction(data: { fullName: string; email: string; password: string; organizationName: string; invitationEmails: string[] }) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
        invitationEmails: data.invitationEmails,
      }),
    });
    console.log('[WEB] /auth/user/signup response', response.status, response);
    const data_response = await response.json();
    console.log('[WEB] /auth/user/signup response', data_response);
    return data_response;
  } catch (e: any) {
    console.error('[WEB] /auth/user/signup error', e?.response?.status, e?.response?.data || e?.message);
    const msg = e?.response?.data?.message || 'Sign up failed';
    throw new Error(msg);
  }
}
