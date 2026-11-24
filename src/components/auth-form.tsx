"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { recoverySchema, resetFormSchema, signInSchema, signUpSchema, validationMessage } from "@/lib/validation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/store";
import { fetchSession } from "@/lib/session-state";

type Mode = "signin" | "signup" | "recovery" | "reset";
type Props = { mode: Mode; initialEmail?: string; initialNotice?: string };
type Values = Record<string, string>;
const titles: Record<Mode, { eyebrow: string; title: string; description: string; action: string }> = {
  signin: { eyebrow: "WELCOME BACK", title: "Good to see you.", description: "Sign in to your FreshCart account to pick up where you left off.", action: "Sign in" },
  signup: { eyebrow: "JOIN THE GOOD STUFF", title: "Make yourself at home.", description: "Create an account for easier shopping and order updates.", action: "Create account" },
  recovery: { eyebrow: "ACCOUNT RECOVERY", title: "Let’s get you back in.", description: "We’ll send a reset code to the email linked to your account.", action: "Send reset code" },
  reset: { eyebrow: "CHOOSE A NEW PASSWORD", title: "Almost there.", description: "Enter the email, reset code, and a new password to finish resetting your account.", action: "Reset password" },
};
async function send(path: string, data: Values) {
  const response = await fetch(path, { method: path.includes("verify-token") ? "GET" : "POST", headers: { "Content-Type": "application/json" }, ...(path.includes("verify-token") ? {} : { body: JSON.stringify(data) }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "Something went wrong. Please try again.");
  return result;
}
export function AuthForm({ mode, initialEmail = "", initialNotice = "" }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [values, setValues] = useState<Values>({ email: initialEmail });
  const [busy, setBusy] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { if (initialNotice) toast.success(initialNotice); }, [initialNotice]);
  const config = titles[mode];
  const update = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => setValues(current => ({ ...current, [key]: event.target.value }));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const schema = mode === "signin" ? signInSchema : mode === "signup" ? signUpSchema : mode === "recovery" ? recoverySchema : resetFormSchema;
    const validation = schema.safeParse(values);
    if (!validation.success) { toast.error(validationMessage(validation.error)); return; }
    setBusy(true);
    try {
      if (mode === "signin" || mode === "signup") {
        await send(`/api/auth/${mode}`, mode === "signin" ? { ...values, keepLoggedIn: String(keepLoggedIn) } : values);
        await dispatch(fetchSession()).unwrap();
        toast.success(mode === "signup" ? "Your account is ready. Welcome to FreshCart!" : "You’re signed in.");
        router.push("/account"); router.refresh();
      } else if (mode === "recovery") {
        await send("/api/auth/forgot-password", values);
        toast.success("If an account matches that email, a reset code has been sent. Check your inbox, then continue to reset your password.");
        router.push(`/account/reset-password?email=${encodeURIComponent(values.email ?? "")}`);
      } else {
        await send("/api/auth/verify-reset-code", { resetCode: values.resetCode ?? "" });
        await send("/api/auth/reset-password", { email: values.email ?? "", newPassword: values.newPassword ?? "" });
        toast.success("Password updated. You can now sign in with your new password.");
        router.push("/account/login?reset=success");
      }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page wrap"><a href="/" className="back-link"><ArrowLeft size={15}/> Back to FreshCart</a><div className="auth-card"><div className="auth-art"><div className="auth-art-orbit"/><span className="auth-fruit fruit-one">🥑</span><span className="auth-fruit fruit-two">🍓</span><span className="auth-fruit fruit-three">🥬</span><span className="eyebrow">YOUR EVERYDAY MARKET</span><h2>Fresh finds.<br/><em>Right on time.</em></h2><p>Good food and thoughtful everyday essentials, all in one happy place.</p></div><div className="auth-content"><span className="eyebrow">{config.eyebrow}</span><h1>{config.title}</h1><p className="auth-description">{config.description}</p><form onSubmit={submit} className="auth-form">
    {mode === "signup" && <Field label="Full name" name="name" value={values.name} onChange={update("name")} autoComplete="name" required/>}
    {(mode === "signin" || mode === "signup" || mode === "recovery" || mode === "reset") && <Field label="Email address" name="email" type="email" value={values.email} onChange={update("email")} autoComplete="email" required/>}
    {mode === "signin" && <div className="auth-field password-field"><label htmlFor="signin-password">Password</label><span className="password-input-wrap"><input id="signin-password" name="password" type={showPassword ? "text" : "password"} value={values.password ?? ""} onChange={update("password")} autoComplete="current-password" required/><button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></div>}
    {mode === "signin" && <label className="auth-remember"><input type="checkbox" checked={keepLoggedIn} onChange={event => setKeepLoggedIn(event.target.checked)}/><span>Keep me logged in</span></label>}
    {mode === "signup" && <><Field label="Phone number" name="phone" type="tel" value={values.phone} onChange={update("phone")} autoComplete="tel" required/><Field label="Password" name="password" type="password" value={values.password} onChange={update("password")} autoComplete="new-password" minLength={6} required/><Field label="Confirm password" name="rePassword" type="password" value={values.rePassword} onChange={update("rePassword")} autoComplete="new-password" minLength={6} required/></>}
    {mode === "reset" && <><Field label="Reset code" name="resetCode" value={values.resetCode} onChange={update("resetCode")} inputMode="numeric" required/><Field label="New password" name="newPassword" type="password" value={values.newPassword} onChange={update("newPassword")} autoComplete="new-password" minLength={6} required/></>}
    <button className="primary-button auth-submit" disabled={busy}>{busy?<><LoaderCircle className="spin" size={16}/> Please wait…</>:<>{config.action}<ArrowRight size={16}/></>}</button>
  </form>{(mode === "signin" || mode === "signup") && <div className="social-auth" aria-label="Other sign in options"><div className="social-auth-divider"><span>or continue with</span></div><button className="social-auth-button" type="button"><GoogleMark/><span>Continue with Google</span></button><button className="social-auth-button" type="button"><FacebookMark/><span>Continue with Facebook</span></button></div>}<div className="auth-links">{mode === "signin" && <><a href="/account/forgot-password">Forgot password?</a><span>New to FreshCart? <a href="/account/signup">Create an account</a></span></>}{mode === "signup" && <span>Already have an account? <a href="/account/login">Sign in</a></span>}{mode === "recovery" && <span>Remembered it? <a href="/account/login">Go to sign in</a></span>}{mode === "reset" && <span>Need another code? <a href="/account/forgot-password">Start again</a></span>}</div></div></div></main>;
}
function GoogleMark() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="social-auth-google"><path fill="currentColor" d="M21.35 12.2c0-.72-.06-1.42-.18-2.1H12v3.97h5.24a4.48 4.48 0 0 1-1.95 2.94v2.45h3.16c1.85-1.7 2.9-4.2 2.9-7.26ZM12 21.7c2.65 0 4.88-.88 6.5-2.4l-3.17-2.45c-.88.59-2 .94-3.33.94-2.56 0-4.73-1.73-5.51-4.06H3.22v2.53A9.82 9.82 0 0 0 12 21.7ZM6.49 13.73a5.9 5.9 0 0 1 0-3.46V7.74H3.22a9.82 9.82 0 0 0 0 8.52l3.27-2.53ZM12 6.2c1.45 0 2.75.5 3.77 1.5l2.83-2.83C16.87 3.3 14.64 2.3 12 2.3a9.82 9.82 0 0 0-8.78 5.44l3.27 2.53C7.27 7.94 9.44 6.2 12 6.2Z"/></svg> }
function FacebookMark() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="social-auth-facebook"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.4c0-3.03 1.79-4.7 4.54-4.7 1.32 0 2.7.24 2.7.24v2.98h-1.52c-1.5 0-1.97.94-1.97 1.9v2.25h3.35l-.54 3.49h-2.81V24C19.61 23.09 24 18.09 24 12.07Z"/></svg> }
function Field({ label, name, type = "text", value, onChange, ...props }: { label: string; name: string; type?: string; value?: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="auth-field">{label}<input name={name} type={type} value={value ?? ""} onChange={onChange} {...props}/></label>; }
