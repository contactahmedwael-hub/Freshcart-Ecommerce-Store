import { NextRequest, NextResponse } from "next/server";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import { changePasswordSchema, profileSchema, validationMessage } from "@/lib/validation";

const endpoints: Record<string, string> = { profile: "/users/updateMe/", password: "/users/changeMyPassword" };
export async function PUT(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const endpoint = endpoints[action];
  if (!endpoint) return NextResponse.json({ message: "Not found." }, { status: 404 });
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Please sign in to continue." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please submit valid form data." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Please submit valid form data." }, { status: 400 });
  const validation = (action === "profile" ? profileSchema : changePasswordSchema).safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi(endpoint, { method: "PUT", body: validation.data, token });
  return NextResponse.json(result.result, { status: result.status });
}
