import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, callAuthApi, currentToken } from "@/lib/auth-server";
import { recoverySchema, resetCodeSchema, resetPasswordSchema, signInSchema, signUpSchema, validationMessage } from "@/lib/validation";

const endpoints: Record<string, string> = {
  signup: "/auth/signup",
  signin: "/auth/signin",
  "forgot-password": "/auth/forgotPasswords",
  "verify-reset-code": "/auth/verifyResetCode",
  "reset-password": "/auth/resetPassword",
};
const publicActions = new Set(["signup", "signin", "forgot-password", "verify-reset-code", "reset-password"]);
function message(result: Record<string, unknown>) { return typeof result.message === "string" ? result.message : "Request failed. Please check your details and try again."; }

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action === "logout") {
    const response = NextResponse.json({ message: "You have been signed out." });
    response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  }
  if (!publicActions.has(action)) return NextResponse.json({ message: "Not found." }, { status: 404 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Please submit valid form data." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Please submit valid form data." }, { status: 400 });
  const schema = action === "signin" ? signInSchema : action === "signup" ? signUpSchema : action === "forgot-password" ? recoverySchema : action === "verify-reset-code" ? resetCodeSchema : resetPasswordSchema;
  const validation = schema.safeParse(body);
  if (!validation.success) return NextResponse.json({ message: validationMessage(validation.error) }, { status: 400 });
  const result = await callAuthApi(endpoints[action], { method: action === "reset-password" ? "PUT" : "POST", body: validation.data });
  const response = NextResponse.json(result.result, { status: result.status });
  if ((action === "signin" || action === "signup") && result.ok && typeof result.result.token === "string") {
    const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
    const keepLoggedIn = action === "signin" && (body.keepLoggedIn === true || body.keepLoggedIn === "true");
    if (keepLoggedIn) {
      const maxAge = 60 * 60 * 24 * 30;
      response.cookies.set(AUTH_COOKIE, result.result.token, { ...cookieOptions, maxAge });
    } else {
      response.cookies.set(AUTH_COOKIE, result.result.token, cookieOptions);
    }
  }
  return response;
}

export async function GET() {
  const token = await currentToken();
  if (!token) return NextResponse.json({ message: "Please sign in to continue." }, { status: 401 });
  const result = await callAuthApi("/auth/verifyToken", { method: "GET", token });
  if (!result.ok) {
    const response = NextResponse.json({ message: message(result.result) }, { status: result.status });
    if (result.status === 401) response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  }
  return NextResponse.json(result.result);
}
