import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, organizationName, invitationEmails } = body || {};
    if (!email || !password || !fullName || !organizationName) {
      return NextResponse.json({ message: "Email, password, and fullName are required" }, { status: 400 });
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    console.log("baseURL>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from signup action next server page route.ts page.", process.env.NEXT_PUBLIC_API_URL);
    const response = await fetch(`${baseURL}/auth/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName, organizationName, invitationEmails }),
    });
    const data = await response.json();
    console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from signup action next server page route.ts page.", data);
    return NextResponse.json(data, { status: response.status });
    }catch (error) {
      console.error("Sign up error:", error);
      return NextResponse.json({ message: "Failed to sign up" }, { status: 500 });  
    }
}
