import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { reviewSchema, validationMessage } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  if (!/^[a-f\d]{24}$/i.test(reviewId)) return NextResponse.json({ message: "Please choose a valid review." }, { status: 400 });
  const result = await callAuthApi(`/reviews/${encodeURIComponent(reviewId)}`, { method: "GET" });
  return NextResponse.json(result.result, { status: result.status });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to edit your review." }, { status: 401 });
  const { reviewId } = await params;
  if (!/^[a-f\d]{24}$/i.test(reviewId)) return NextResponse.json({ message: "Please choose a valid review." }, { status: 400 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please enter a review and rating." }, { status: 400 }); }
  const validation = reviewSchema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi(`/reviews/${encodeURIComponent(reviewId)}`, { method: "PUT", body: validation.data, token });
  return NextResponse.json(result.result, { status: result.status });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Sign in to delete your review." }, { status: 401 });
  const { reviewId } = await params;
  if (!/^[a-f\d]{24}$/i.test(reviewId)) return NextResponse.json({ message: "Please choose a valid review." }, { status: 400 });
  const result = await callAuthApi(`/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE", token });
  return NextResponse.json(result.result, { status: result.status });
}
