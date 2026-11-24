import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { shippingAddressSchema, validationMessage } from "@/lib/validation";

export async function POST(request: NextRequest, { params }: { params: Promise<{ cartId: string }> }) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in before checkout." }, { status: 401 });
  const { cartId } = await params;
  if (!/^[a-f\d]{24}$/i.test(cartId)) return NextResponse.json({ message: "Your cart is not ready for checkout." }, { status: 400 });
  let body: { shippingAddress?: Record<string, unknown> };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter your shipping address to continue." }, { status: 400 }); }
  const validation = shippingAddressSchema.safeParse(body?.shippingAddress);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const shippingAddress = validation.data;
  const configuredUrl = process.env.FRESHCART_SITE_URL;
  const origin = configuredUrl ?? request.nextUrl.origin;
  let returnUrl: URL;
  try { returnUrl = new URL(origin); } catch { return NextResponse.json({ message: "Checkout is not configured for this site." }, { status: 500 }); }
  if (returnUrl.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && returnUrl.hostname === "localhost")) return NextResponse.json({ message: "Checkout requires a secure site URL." }, { status: 500 });
  const query = new URLSearchParams({ url: returnUrl.origin });
  const result = await callAuthApi(`/orders/checkout-session/${encodeURIComponent(cartId)}?${query}`, { method: "POST", body: { shippingAddress }, token });
  return NextResponse.json(result.result, { status: result.status });
}
