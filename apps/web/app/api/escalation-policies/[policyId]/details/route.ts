import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest, { params }: { params: { policyId: string } }) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  
  const { policyId } = params;
  
  try {
    const res = await fetch(`${BASE_URL}/escalation-policies/${policyId}/details`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching policy details:", error);
    return NextResponse.json({ message: "Failed to fetch policy details" }, { status: 500 });
  }
}