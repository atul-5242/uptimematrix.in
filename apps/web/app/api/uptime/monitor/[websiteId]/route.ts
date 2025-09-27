// app/api/monitor/[websiteId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const { websiteId } = params;

    if (!websiteId) {
      return NextResponse.json(
        { message: "Website ID is required" },
        { status: 400 }
      );
    }

    // Call your Express backend to get website status
    const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const authHeader =  req.headers.get("authorization") ||
    `Bearer ${req.cookies.get("auth_token")?.value || ""}`;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
    }

    const backendRes = await fetch(
      `${NEXT_PUBLIC_API_URL}/website/status/${websiteId}`,{ 
        method: "GET" ,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Forward auth token
        },
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(error, { status: backendRes.status });
    }
    console.log("websiteIdbackendRes.json()------------------------------>>>>>>>>>>>>>>>>>>>>>>>>>>", backendRes);
    const data = await backendRes.json();
    console.log("websiteId_____________________________________>>>>>>>>>>>>>>>>>>>>>>>>>>", data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Monitor GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch website status" },
      { status: 500 }
    );
  }
}
