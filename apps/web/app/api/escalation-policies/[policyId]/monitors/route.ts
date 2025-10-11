import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(
  req: NextRequest,
  { params }: { params: { policyId: string } }
) {
  const headerToken = req.headers.get("authorization")?.split(" ")[1];
  const token = headerToken;
  
  if (!token) {
    return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BASE_URL}/escalation-policies/${params.policyId}/monitors`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching policy monitors:", error);
    return NextResponse.json(
      { message: "Failed to fetch policy monitors" },
      { status: 500 }
    );
  }
}