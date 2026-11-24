import { NextResponse } from "next/server";
import { getSubcategories } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  if (!/^[a-f\d]{24}$/i.test(categoryId)) return NextResponse.json({ message: "Choose a valid category." }, { status: 400 });
  try { return NextResponse.json({ subcategories: await getSubcategories(categoryId) }); }
  catch { return NextResponse.json({ message: "Subcategories are temporarily unavailable." }, { status: 502 }); }
}
