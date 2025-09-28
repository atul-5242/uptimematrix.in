import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    const userIdCookie = cookieStore.get('auth_userId')?.value;
    let userId = userIdCookie;
    
    console.log('Session check - Token exists:', !!token);
    console.log('Session check - User ID from cookie:', userIdCookie);

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      );
    }
    
    // Extract user ID from JWT token if not in cookies
    if (!userId) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        userId = payload.sub;
        console.log('Extracted userId from JWT:', userId);
      } catch (error) {
        console.error('Error extracting userId from JWT:', error);
      }
    }

    // Validate the token and user against the database
    const baseURL = "https://api.uptimematrix.atulmaurya.in/";
    const response = await fetch(`${baseURL}/auth/validate-session`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      // If validation fails, clear the auth cookies
      const errorResponse = new NextResponse(
        JSON.stringify({ isAuthenticated: false, user: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
      
      // Clear auth cookies
      errorResponse.cookies.set('auth_token', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: new Date(0),
      });
      
      errorResponse.cookies.set('auth_userId', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: new Date(0),
      });

      return errorResponse;
    }

    // If validation succeeds, return the user data
    const userData = await response.json();
    return NextResponse.json(
      { 
        isAuthenticated: true, 
        token, // Make sure to include the token in the response
        user: { id: userId, ...userData }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
    
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { isAuthenticated: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
