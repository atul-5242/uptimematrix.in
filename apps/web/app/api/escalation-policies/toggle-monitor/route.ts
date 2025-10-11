import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  
  if (!token) {
    return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.policyId || !body.monitorId || typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { message: "policyId, monitorId, and enabled (boolean) are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/escalation-policies/toggle-monitor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error toggling monitor policy:", error);
    return NextResponse.json(
      { message: "Failed to toggle monitor policy" },
      { status: 500 }
    );
  }
}