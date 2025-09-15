import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let authToken = req.headers.get('authorization');

    if (!authToken) {
      const cookieStore = cookies();
      const sessionToken = cookieStore.get('auth_token')?.value;
      if (sessionToken) {
        authToken = `Bearer ${sessionToken}`;
      }
    }

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }
  console.log("Fetching pending invitations...>>>>>>>>>>>>>");
  try {
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/organization/invitations/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
