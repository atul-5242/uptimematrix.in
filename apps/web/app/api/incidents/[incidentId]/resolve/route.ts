import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  const headerToken = req.headers.get("authorization")?.split(" ")[1];
  const token = headerToken;
  
  if (!token) {
    return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const res = await fetch(`${BASE_URL}/api/incidents/incident/${params.incidentId}/resolve`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error resolving incident:", error);
    return NextResponse.json(
      { message: "Failed to resolve incident" },
      { status: 500 }
    );
  }
}