import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const { userId } = params;
    const url = `${API_BASE_URL}/organization/members/${encodeURIComponent(userId)}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to remove member from organization' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete organization member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
