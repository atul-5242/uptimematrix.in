import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const { invitationLink,name } = await req.json();

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/organization/invitations/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ invitationLink,name }),
    });

    const backendData = await backendResponse.json(); // Read once
    console.log("Backend response:", backendData);

    if (!backendResponse.ok) {
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    return NextResponse.json(backendData);
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
