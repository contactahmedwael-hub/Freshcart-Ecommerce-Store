import { NextResponse } from "next/server";
import { callAuthApi, currentToken, verifiedIdentity } from "@/lib/auth-server";

export async function GET() {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to view your orders." }, { status: 401 });
  const identity = await verifiedIdentity(token);
  if (!identity) return NextResponse.json({ message: "Your session has expired. Sign in again to view your orders." }, { status: 401 });
  const result = await callAuthApi(`/orders/user/${encodeURIComponent(identity.id)}`, { method: "GET", token });
  return NextResponse.json(result.result, { status: result.status });
}
