import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body || {};
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const upstream = await fetch(`${baseURL}/auth/user/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ message: text || 'Authentication failed' }, { status: upstream.status });
    }

    const data = await upstream.json();
    const token: string | undefined = data?.jwt;
    if (!token) {
      return NextResponse.json({ message: 'JWT not returned by upstream' }, { status: 502 });
    }

    const response = NextResponse.json({ jwt: token });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || 'Internal error' }, { status: 500 });
  }
}


