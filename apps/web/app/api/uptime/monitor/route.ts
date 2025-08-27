// app/api/monitor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url, monitorType, checkInterval, method, regions, escalationPolicyId, tags } = body;

    if (!url || !name) {
      return NextResponse.json({ message: "Name and URL are required" }, { status: 400 });
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
      body: JSON.stringify({
        name,
        url,
        monitorType,
        checkInterval,
        method,
        regions,
        escalationPolicyId,
        tags,
      }),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();

    revalidatePath('/dashboard/monitoring');
    return NextResponse.json({ success: true, websiteId: data.id }, { status: 201 });
  } catch (error: any) {
    console.error("Monitor POST error:", error);
    return NextResponse.json(
      { message: "Failed to create monitor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log("DELETE request received",);
    const { id } = await req.json();
    console.log("id",id);
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
    }

    // call upstream API (your monitoring backend)
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const backendRes = await fetch(`${baseURL}/website/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json();
    console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from delete action next server page route.ts page.", data);

    return NextResponse.json({ message: "Website deleted successfully", id });
  } catch (error) {
    console.error("Error deleting website:", error);
    return NextResponse.json({ message: "Failed to delete website" });
  }
}