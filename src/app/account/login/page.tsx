import { AuthForm } from "@/components/auth-form";
import { redirect } from "next/navigation";
import { callAuthApi, currentToken } from "@/lib/auth-server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string; signedOut?: string }> }) {
  const token = await currentToken();
  if (token && (await callAuthApi("/auth/verifyToken", { method: "GET", token })).ok) redirect("/");

  const { reset, signedOut } = await searchParams;
  const initialNotice = reset === "success" ? "Your password was reset. Sign in with your new password." : signedOut === "1" ? "You have been signed out." : "";
  return <AuthForm mode="signin" initialNotice={initialNotice}/>;
}
