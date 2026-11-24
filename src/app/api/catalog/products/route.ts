import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import type { CatalogFilters } from "@/lib/types";

const sorts = new Set(["", "price", "-price", "ratingsAverage", "-ratingsAverage", "createdAt", "-createdAt", "title", "-title"]);
function number(value: string | null, fallback?: number) {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const page = number(query.get("page"), 1);
  const limit = number(query.get("limit"), 12);
  const minPrice = number(query.get("minPrice"));
  const maxPrice = number(query.get("maxPrice"));
  const sort = query.get("sort") ?? "";
  if (!page || !limit || limit > 48 || !sorts.has(sort) || (query.get("minPrice") && minPrice === undefined) || (query.get("maxPrice") && maxPrice === undefined)) {
    return NextResponse.json({ message: "Choose valid catalog filters." }, { status: 400 });
  }
  const filters: CatalogFilters = {
    page, limit, sort: sort || undefined,
    keyword: query.get("keyword")?.slice(0, 100) || undefined,
    category: query.get("category") || undefined,
    brand: query.get("brand") || undefined,
    minPrice, maxPrice,
  };
  try { return NextResponse.json(await getProducts(filters)); }
  catch { return NextResponse.json({ message: "Products are temporarily unavailable." }, { status: 502 }); }
}
