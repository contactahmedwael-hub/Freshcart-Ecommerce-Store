import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { addCartItemSchema, validationMessage } from "@/lib/validation";

async function authorizedCartRequest(path: string, method: "GET" | "POST" | "DELETE", body?: unknown) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to use your cart." }, { status: 401 });
  const result = await callAuthApi(path, { method, ...(body === undefined ? {} : { body }), token, version: 2, bearer: true });
  return NextResponse.json(result.result, { status: result.status });
}

export async function GET() { return authorizedCartRequest("/cart", "GET"); }

export async function POST(request: NextRequest) {
  let body: { productId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 }); }
  const validation = addCartItemSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  return authorizedCartRequest("/cart", "POST", validation.data);
}

export async function DELETE() { return authorizedCartRequest("/cart", "DELETE"); }
