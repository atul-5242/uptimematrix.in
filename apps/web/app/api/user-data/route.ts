import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    const organizationId = request.nextUrl.searchParams.get('organizationId');

    // If no authorization header, return unauthorized
    if (!authHeader) {
      return NextResponse.json({ 
        message: 'Unauthorized: No token provided' 
      }, { status: 401 });
    }

    // Backend API URL (adjust as needed)
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';

    // Proxy the request to the backend with no-cache headers
    const response = await fetch(`${backendUrl}/userprofile/me` + (organizationId ? `?organizationId=${organizationId}` : ''), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });

    // Handle backend response
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        message: errorData.message || 'Failed to fetch user data',
      }, { 
        status: response.status 
      });
    }

    // Return the user data with no-cache headers
    const userData = await response.json();
    const nextResponse = NextResponse.json(userData);
    
    // Set cache headers to prevent caching
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    
    return nextResponse;

  } catch (error) {
    console.error('User data fetch error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
