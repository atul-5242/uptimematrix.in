import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;;

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/organization-members`, {
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      console.error(`Backend responded with status ${response.status}`);
      const errorText = await response.text(); // Get raw text to inspect
      console.error('Backend response text:', errorText);
      try {
        const errorData = JSON.parse(errorText); // Try parsing as JSON
        return NextResponse.json(errorData, { status: response.status });
      } catch (jsonError) {
        console.error('Failed to parse backend error response as JSON:', jsonError);
        // If not JSON, return a generic error or the raw text
        return NextResponse.json({ message: 'Backend error: ' + errorText }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying GET /api/users/organization-members:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
