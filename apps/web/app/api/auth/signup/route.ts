import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, organizationName, invitationEmails } = body || {};

    if (!email || !password || !fullName || !organizationName) {
      return NextResponse.json(
        { message: "Email, password, fullName, and organizationName are required" },
        { status: 400 }
      );
    }

   
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    console.log(
      "baseURL from env >>>",
      process.env.NEXT_PUBLIC_API_URL
    );

    const response = await fetch(`${baseURL}/auth/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, organizationName, invitationEmails }),
    });

    const data = await response.json();

    console.log("signup response data >>>", data);

    return NextResponse.json(
      {
        success: true,
        data,
        baseURLUsed: baseURL, 
      },
      { status: response.status }
    );
  } catch (error: any) {
    console.error("Sign up error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to sign up",
        baseURLUsed: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", 
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
