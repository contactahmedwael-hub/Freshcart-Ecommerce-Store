import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { couponSchema, validationMessage } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to apply a coupon." }, { status: 401 });
  let body: { couponName?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter a valid coupon code." }, { status: 400 }); }
  const validation = couponSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi("/cart/applyCoupon", { method: "PUT", body: validation.data, token, version: 2, bearer: true });
  return NextResponse.json(result.result, { status: result.status });
}
