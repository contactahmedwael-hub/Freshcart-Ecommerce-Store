import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";

export async function GET() {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to view your wishlist." }, { status: 401 });
  const result = await callAuthApi("/wishlist", { method: "GET", token });
  return NextResponse.json(result.result, { status: result.status });
}

export async function POST(request: NextRequest) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to save products to your wishlist." }, { status: 401 });
  let body: { productId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 }); }
  if (typeof body?.productId !== "string" || !/^[a-f\d]{24}$/i.test(body.productId)) return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 });
  const result = await callAuthApi("/wishlist", { method: "POST", body: { productId: body.productId }, token });
  return NextResponse.json(result.result, { status: result.status });
}
