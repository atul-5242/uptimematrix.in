import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;

export async function GET(request: NextRequest) {
  try {
    console.log('[Frontend API] GET /api/team-section/team called');
    const token = request.headers.get('authorization');
    
    if (!token) {
      console.log('[Frontend API] No authorization token provided');
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    console.log(`[Frontend API] Calling backend: ${API_BASE_URL}/api/teams`);
    const response = await fetch(`${API_BASE_URL}/api/teams`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
    });
    console.log(`[Frontend API] Backend response status: ${response.status}`);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch teams' }, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return nextResponse;
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/teams`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to create team' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
