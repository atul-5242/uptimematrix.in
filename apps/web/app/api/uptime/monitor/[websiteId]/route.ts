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
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/website/${websiteId}`,
      { method: "GET" }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Monitor GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch website status" },
      { status: 500 }
    );
  }
}
