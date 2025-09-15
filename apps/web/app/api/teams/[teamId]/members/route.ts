import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  const token = req.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { teamId } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying GET /api/teams/${teamId}/members:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
