import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // Proxy the request to the backend
    const response = await fetch(`${backendUrl}/userprofile/me` + (organizationId ? `?organizationId=${organizationId}` : ''), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
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

    // Return the user data
    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('User data fetch error:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
