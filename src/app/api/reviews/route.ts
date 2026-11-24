import { NextRequest, NextResponse } from "next/server";
import { callAuthApi } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ["limit", "page", "keyword"] as const) {
    const value = request.nextUrl.searchParams.get(key);
    if (value && value.length <= 100) params.set(key, value);
  }
  const result = await callAuthApi(`/reviews${params.size ? `?${params.toString()}` : ""}`, { method: "GET" });
  return NextResponse.json(result.result, { status: result.status });
}
