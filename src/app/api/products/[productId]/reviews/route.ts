import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { reviewSchema, validationMessage } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  if (!/^[a-f\d]{24}$/i.test(productId)) return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 });
  const result = await callAuthApi(`/products/${encodeURIComponent(productId)}/reviews`, { method: "GET" });
  return NextResponse.json(result.result, { status: result.status });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to write a review." }, { status: 401 });
  const { productId } = await params;
  if (!/^[a-f\d]{24}$/i.test(productId)) return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please enter a review and rating." }, { status: 400 }); }
  const validation = reviewSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi(`/products/${encodeURIComponent(productId)}/reviews`, { method: "POST", body: validation.data, token });
  return NextResponse.json(result.result, { status: result.status });
}
