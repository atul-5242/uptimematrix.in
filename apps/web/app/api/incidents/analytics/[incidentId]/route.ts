import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  try {
    // Get the token from the auth endpoint
    const tokenResponse = await fetch(new URL('/api/auth/get-token', request.url));
    if (!tokenResponse.ok) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { incidentId } = params;
    const backendUrl = `${API_BASE_URL}/api/incidents/analytics/${incidentId}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to fetch incident analytics' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in incident analytics API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  try {
    // Get the token from the auth endpoint
    const tokenResponse = await fetch(new URL('/api/auth/get-token', request.url));
    if (!tokenResponse.ok) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { token } = await tokenResponse.json();
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { incidentId } = params;
    const { status } = await request.json();
    const url = new URL(`/api/incidents/analytics/${incidentId}/status`, API_BASE_URL);
    
    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Failed to update incident status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating incident status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
