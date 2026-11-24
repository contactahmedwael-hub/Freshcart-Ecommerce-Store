import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Forgot Password" };
export default function ForgotPasswordPage() { return <AuthForm mode="recovery"/>; }
