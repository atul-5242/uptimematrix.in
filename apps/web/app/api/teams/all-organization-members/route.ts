import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/teams/all-organization-members`, {
      headers: {
        'Authorization': token,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cache: 'no-store'
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
    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return nextResponse;
  } catch (error) {
    console.error('Error proxying GET /api/teams/all-organization-members:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
