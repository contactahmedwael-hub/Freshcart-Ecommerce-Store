import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Reset Password" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) { const { email } = await searchParams; return <AuthForm mode="reset" initialEmail={email}/>; }
