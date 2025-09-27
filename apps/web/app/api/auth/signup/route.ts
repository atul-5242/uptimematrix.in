import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Use a consistent baseURL for both try and catch
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://api.uptimematrix.atulmaurya.in";

  try {
    const body = await request.json();
    const { email, password, fullName, organizationName, invitationEmails } = body || {};

    if (!email || !password || !fullName || !organizationName) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, fullName, and organizationName are required",
          baseURLUsed: baseURL,
        },
        { status: 400 }
      );
    }

    console.log("baseURL being used >>>", baseURL);

    const response = await fetch(`${baseURL}/auth/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, organizationName, invitationEmails }),
    });

    const data = await response.json();
    console.log("signup response data >>>", data);

    return NextResponse.json(
      {
        success: response.ok,
        data,
        baseURLUsed: baseURL, // Always included
      },
      { status: response.status }
    );

  } catch (error: any) {
    console.error("Sign up error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to sign up",
        baseURLUsed: baseURL, // Use same baseURL as above
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
