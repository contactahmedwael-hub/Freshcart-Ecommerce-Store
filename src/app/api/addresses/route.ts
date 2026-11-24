import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { addressSchema, validationMessage } from "@/lib/validation";

export async function GET() {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to view your saved addresses." }, { status: 401 });
  const result = await callAuthApi("/addresses", { method: "GET", token });
  return NextResponse.json(result.result, { status: result.status });
}

export async function POST(request: NextRequest) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to save a delivery address." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please submit valid address details." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Please submit valid address details." }, { status: 400 });
  const validation = addressSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi("/addresses", { method: "POST", body: validation.data, token });
  return NextResponse.json(result.result, { status: result.status });
}
