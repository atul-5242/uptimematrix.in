import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL;;
    const upstream = await fetch(`${baseURL}/auth/user/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ message: text || 'Authentication failed' }, { status: upstream.status });
    }

    const data = await upstream.json();
    console.log('API response data:', JSON.stringify(data, null, 2));
    
    const token: string | undefined = data?.jwt;
    
    // Extract user ID from JWT token
    let userId: string | undefined;
    if (token) {
      try {
        // Base64 decode the payload part of the JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        userId = payload.sub; // sub is the standard JWT field for user ID
        console.log('Decoded JWT payload:', payload);
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    }
    
    console.log('Extracted token:', !!token);
    console.log('Extracted userId:', userId);
    
    if (!token) {
      return NextResponse.json({ message: 'JWT not returned by upstream' }, { status: 502 });
    }

    if (!userId) {
      throw new Error('User ID not found in response');
    }

    // Create response with user data
    const response = NextResponse.json(
      { 
        token,
        user: { id: userId },
        isAuthenticated: true
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );

    // Set auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set user ID cookie
    response.cookies.set({
      name: 'auth_userId',
      value: userId,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
