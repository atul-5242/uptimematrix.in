import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    let token = request.headers.get('authorization');
    
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    // This route now specifically handles fetching members for a given team.
    // If no teamId is provided, it's an invalid request for this endpoint.
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required as a query parameter for this endpoint' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch team members' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get team members error:', error);
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
    const { teamId, userId, roleId, isTeamLead } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, roleId, isTeamLead }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to add member to team' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
