import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  // Clear auth token cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });

  // Clear user ID cookie
  response.cookies.set('auth_userId', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });

  // Clear any session-related headers
  response.headers.set('Clear-Site-Data', '"cookies", "storage"');
  
  return response;
}
