import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, password, fullName } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // For new users, password and fullName are required
    // For existing users, they are optional
    const requestBody: any = { token };
    
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { message: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      requestBody.password = password;
    }
    
    if (fullName) {
      requestBody.fullName = fullName.trim();
    }

    // Make API call to backend to accept invitation
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/accept-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: backendData.message || 'Failed to accept invitation' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      user: backendData.user,
    });

  } catch (error: any) {
    console.error('[Frontend API] Accept invitation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
