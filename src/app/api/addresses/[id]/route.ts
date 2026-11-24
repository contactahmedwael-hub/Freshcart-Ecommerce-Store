import { NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";

async function addressRequest(id: string, method: "GET" | "DELETE") {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to access your saved addresses." }, { status: 401 });
  if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ message: "Please choose a valid address." }, { status: 400 });
  const result = await callAuthApi(`/addresses/${encodeURIComponent(id)}`, { method, token });
  return NextResponse.json(result.result, { status: result.status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return addressRequest(id, "GET");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return addressRequest(id, "DELETE");
}
