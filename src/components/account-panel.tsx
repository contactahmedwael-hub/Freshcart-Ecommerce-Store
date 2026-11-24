"use client";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, LogOut, UserRound, LockKeyhole, MapPin, PackageCheck, Eye, EyeOff } from "lucide-react";
import { changePasswordSchema, validationMessage } from "@/lib/validation";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/store";
import { signOut as signOutThunk } from "@/lib/session-state";

type ApiPayload = { message?: string; user?: { name?: string; email?: string; phone?: string }; data?: { name?: string; email?: string; phone?: string }; decoded?: { name?: string; email?: string } };
export function AccountPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const [session, setSession] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error] = useState("");
  const [notice] = useState("");
  useEffect(() => { fetch("/api/auth/verify-token").then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.message ?? "Please sign in."); setSession(data); }).catch(() => setSession(null)).finally(() => setLoading(false)); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget; const body = Object.fromEntries(Array.from(new FormData(formElement).entries()).map(([key, value]) => [key, String(value)]));
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) { toast.error(validationMessage(validation.error)); return; }
    setBusy("password");
    try { const r = await fetch("/api/account/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data) }); const data = await r.json(); if (!r.ok) throw new Error(data.message ?? "Could not save your changes."); toast.success(data.message ?? "Your password has been changed."); formElement.reset(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not save your changes."); }
    finally { setBusy(""); }
  }
  async function logout() { setBusy("logout"); try { await dispatch(signOutThunk()).unwrap(); window.location.replace("/account/login?signedOut=1"); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not sign out."); setBusy(""); } }
  if (loading) return <main className="account-page wrap"><div className="account-loading"><LoaderCircle className="spin"/> Checking your account…</div></main>;
  if (!session) return <main className="account-page wrap"><div className="account-gate"><span className="account-icon"><UserRound/></span><span className="eyebrow">YOUR FRESHCART ACCOUNT</span><h1>Sign in to your account</h1><p>Access profile settings and keep your account details up to date.</p><a className="primary-button" href="/account/login">Sign in <span>→</span></a><a className="account-back" href="/">Continue shopping</a></div></main>;
  return <main className="account-page wrap"><a href="/" className="back-link"><ArrowLeft size={15}/> Back to FreshCart</a><div className="account-heading"><div><span className="eyebrow">YOUR FRESHCART ACCOUNT</span><h1>Account settings</h1><p>Update your details and keep your account secure.</p></div><button className="logout-button" onClick={logout} disabled={!!busy}>{busy === "logout" ? "Signing out…" : <><LogOut size={15}/> Sign out</>}</button></div>{error && <p className="form-message error-message" role="alert">{error}</p>}{notice && <p className="form-message success-message" role="status">{notice}</p>}<a className="account-address-link" href="/account/addresses"><MapPin size={18}/><span><b>Delivery addresses</b><small>Manage your saved delivery locations</small></span><strong>→</strong></a><a className="account-address-link" href="/account/orders"><PackageCheck size={18}/><span><b>Order history</b><small>View your orders and payment status</small></span><strong>→</strong></a><div className="account-grid"><section className="account-card"><div className="account-card-title"><LockKeyhole/><div><h2>Change password</h2><p>Choose a strong password you don’t use elsewhere</p></div></div><form className="account-form" onSubmit={submit}><PasswordField label="Current password" name="currentPassword" autoComplete="current-password" required/><PasswordField label="New password" name="password" autoComplete="new-password" minLength={6} required/><PasswordField label="Confirm new password" name="rePassword" autoComplete="new-password" minLength={6} required/><button className="primary-button" disabled={!!busy}>{busy === "password" ? "Updating…" : "Update password"}</button></form></section></div></main>;
}
function PasswordField({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) { const [visible, setVisible] = useState(false); return <div className="auth-field password-field"><label htmlFor={`account-${name}`}>{label}</label><span className="password-input-wrap"><input id={`account-${name}`} name={name} type={visible ? "text" : "password"} {...props}/><button className="password-toggle" type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></div>; }
