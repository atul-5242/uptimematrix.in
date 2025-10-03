import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { roleId: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/roles/${params.roleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to update role' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { roleId: string } }) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/roles/${params.roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to delete role' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
