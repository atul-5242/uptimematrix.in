import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!organizationId) {
      return NextResponse.json(
        { message: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authorization header is missing' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      console.error('[Frontend API] NEXT_PUBLIC_NEXT_PUBLIC_API_URL is not defined.');
      return NextResponse.json(
        { message: 'Backend URL is not configured.' },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(`${backendUrl}/auth/select-organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ organizationId }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('[Frontend API] Error from backend select-organization:', backendData);
      return NextResponse.json(
        { message: backendData.message || 'Failed to update selected organization' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      message: 'Selected organization updated successfully',
      data: backendData,
    });

  } catch (error: any) {
    console.error('[Frontend API] Error in select-organization route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
