import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('Select organization API called');
    
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('No auth token found');
      return NextResponse.json(
        { error: 'Authentication token not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      console.log('No organizationId provided');
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    console.log('Forwarding to backend:', { organizationId });

    // Forward the request to the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/auth/select-organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ organizationId }),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to select organization' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Backend success:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Select organization API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
