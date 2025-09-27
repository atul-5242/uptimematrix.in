import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = "https://api.uptimematrix.atulmaurya.in/";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/roles`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch roles' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
