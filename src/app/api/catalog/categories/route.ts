import { NextResponse } from "next/server";
import { getCategories } from "@/lib/api";

export async function GET() {
  try { return NextResponse.json({ categories: await getCategories() }); }
  catch { return NextResponse.json({ message: "Categories are temporarily unavailable." }, { status: 502 }); }
}
