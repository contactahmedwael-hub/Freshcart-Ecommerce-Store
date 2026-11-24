import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { quantitySchema, validationMessage } from "@/lib/validation";

async function updateOrRemove(productId: string, method: "PUT" | "DELETE", body?: unknown) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to update your cart." }, { status: 401 });
  if (!/^[a-f\d]{24}$/i.test(productId)) return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 });
  const result = await callAuthApi(`/cart/${encodeURIComponent(productId)}`, { method, ...(body === undefined ? {} : { body }), token, version: 2, bearer: true });
  return NextResponse.json(result.result, { status: result.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  let body: { count?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter a valid quantity." }, { status: 400 }); }
  const validation = quantitySchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  return updateOrRemove(productId, "PUT", validation.data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return updateOrRemove(productId, "DELETE");
}
