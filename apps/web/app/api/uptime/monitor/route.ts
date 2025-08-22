// app/api/monitor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
    }

    // call upstream API (your monitoring backend)
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const backendRes = await fetch(`${baseURL}/website/websiteCreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();

    revalidatePath('/dashboard/monitoring');
    return NextResponse.json({ success: true, websiteId: data.id }, { status: 201 });
  } catch (error) {
    console.error("Monitor POST error:", error);
    return NextResponse.json(
      { message: "Failed to create monitor" },
      { status: 500 }
    );
  }
}
