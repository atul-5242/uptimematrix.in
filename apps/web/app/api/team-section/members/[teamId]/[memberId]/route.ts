import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(request: NextRequest, { params }: { params: { teamId: string; memberId: string } }) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, memberId } = params;

    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to update team member' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { teamId: string; memberId: string } }) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const { teamId, memberId } = params;

    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to remove team member' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Remove team member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
