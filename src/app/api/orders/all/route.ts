import { NextResponse } from "next/server";
import { callAuthApi, currentToken, verifiedIdentity } from "@/lib/auth-server";

export async function GET() {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in is required." }, { status: 401 });
  const identity = await verifiedIdentity(token);
  if (!identity) return NextResponse.json({ message: "Your session has expired." }, { status: 401 });
  if (identity.role !== "admin") return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  const result = await callAuthApi("/orders/", { method: "GET", token });
  return NextResponse.json(result.result, { status: result.status });
}
