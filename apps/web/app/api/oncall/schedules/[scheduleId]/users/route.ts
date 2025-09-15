import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(req: NextRequest, { params }: { params: { scheduleId: string } }) {
  const token = req.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { scheduleId } = params;

  try {
    const body = await req.json();
    const response = await fetch(`${API_BASE_URL}/api/oncall/schedules/${scheduleId}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Backend responded with status ${response.status}`);
      const errorText = await response.text();
      console.error('Backend response text:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (jsonError) {
        console.error('Failed to parse backend error response as JSON:', jsonError);
        return NextResponse.json({ message: 'Backend error: ' + errorText }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(`Error proxying POST /api/oncall/schedules/${scheduleId}/users:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
