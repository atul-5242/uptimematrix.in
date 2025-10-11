import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('[Frontend API] Verifying invitation token with backend...');
    console.log('[Frontend API] Backend URL:', process.env.NEXT_PUBLIC_API_URL);

    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('[Frontend API] NEXT_PUBLIC_API_URL is not configured!');
      return NextResponse.json(
        { message: 'API configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Make API call to backend to verify invitation
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.log('[Frontend API] Backend verification failed:', backendData.message);
      return NextResponse.json(
        { message: backendData.message || 'Invalid or expired invitation' },
        { status: backendResponse.status }
      );
    }

    console.log('[Frontend API] Invitation verified successfully');
    return NextResponse.json({
      invitation: backendData.invitation,
    });

  } catch (error: any) {
    console.error('[Frontend API] Verify invitation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
