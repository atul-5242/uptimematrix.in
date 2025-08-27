import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  const res = await fetch(`${BASE_URL}/escalation-policies/get-escalation-policies`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await res.json();
  console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from get escalation policies action next server page route.ts page.", data);
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  const body = await req.json();
  const res = await fetch(`${BASE_URL}/escalation-policies/create-escalation-policy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  const body = await req.json();
  const res = await fetch(`${BASE_URL}/escalation-policies`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Missing auth token" }, { status: 401 });
  const { id } = await req.json();
  const res = await fetch(`${BASE_URL}/escalation-policies/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
