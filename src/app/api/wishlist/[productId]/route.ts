import { NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to update your wishlist." }, { status: 401 });
  const { productId } = await params;
  if (!/^[a-f\d]{24}$/i.test(productId)) return NextResponse.json({ message: "Please choose a valid product." }, { status: 400 });
  const result = await callAuthApi(`/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE", token });
  return NextResponse.json(result.result, { status: result.status });
}
