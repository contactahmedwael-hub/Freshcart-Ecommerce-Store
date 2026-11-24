import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { cashShippingAddressSchema, validationMessage } from "@/lib/validation";

export async function POST(request: NextRequest, { params }: { params: Promise<{ cartId: string }> }) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in before placing an order." }, { status: 401 });
  const { cartId } = await params;
  if (!/^[a-f\d]{24}$/i.test(cartId)) return NextResponse.json({ message: "Your cart is not ready for checkout." }, { status: 400 });
  let body: { shippingAddress?: Record<string, unknown> };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter your shipping address to continue." }, { status: 400 }); }
  const validation = cashShippingAddressSchema.safeParse(body?.shippingAddress);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi(`/orders/${encodeURIComponent(cartId)}`, { method: "POST", body: { shippingAddress: validation.data }, token, version: 2 });
  return NextResponse.json(result.result, { status: result.status });
}
