import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
    }

    const backendRes = await fetch(`${baseURL}/website/getAllWebsites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from getallmonitorsAction next server page route.ts page.", data);

    return NextResponse.json({ success: true, monitors: data }, { status: 200 });
  } catch (error) {
    console.error("Monitor GET error:", error);
    return NextResponse.json({ message: "Failed to fetch monitors" }, { status: 500 });
  }
}
