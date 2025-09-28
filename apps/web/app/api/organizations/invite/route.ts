import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = cookies().get('auth_token')?.value; // Assuming token is stored in cookies

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided." }, { status: 401 });
    }

    const { invitationEmails } = await req.json();

    if (!invitationEmails || !Array.isArray(invitationEmails) || invitationEmails.length === 0) {
      return NextResponse.json({ message: "No invitation emails provided." }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/auth/send-invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ invitationEmails }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Next.js API] Backend error:", data);
      return NextResponse.json({ message: data.message || "Failed to send invitations." }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("[Next.js API] Error sending invitations:", error);
    return NextResponse.json({ message: "Internal server error.", error: error.message }, { status: 500 });
  }
}
