"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LoaderCircle, LogIn, LogOut, MapPin, PackageCheck, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { signOut as signOutThunk } from "@/lib/session-state";
export function AccountMenu() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status, signingOut } = useSelector((state: RootState) => state.session);
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const loading = status === "idle" || status === "loading";
  const signedIn = status === "authenticated";
  const name = user?.name ?? "My account";
  const busy = signingOut;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, []);

  async function signOut() {
    try { await dispatch(signOutThunk()).unwrap(); setOpen(false); window.location.replace("/account/login?signedOut=1"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not sign out."); }
  }

  return <div className="account-menu" ref={root}>
    <button className={`account-menu-trigger${signedIn ? " is-signed-in" : ""}`} aria-label={`${signedIn ? name : "Account"} menu`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <UserRound size={18}/><span>{signedIn ? name : "Account"}</span><ChevronDown className="account-menu-chevron" size={13}/>
    </button>
    {open && <div className="account-dropdown" role="menu">
      <div className="account-dropdown-heading"><span className="account-dropdown-avatar"><UserRound size={17}/></span><div><small>{signedIn ? "SIGNED IN AS" : "YOUR FRESHCART ACCOUNT"}</small><b>{loading ? "Checking account…" : signedIn ? name : "Welcome to FreshCart"}</b></div></div>
      {signedIn ? <>
        <a role="menuitem" href="/account"><UserRound size={16}/> My Profile</a>
        <a role="menuitem" href="/account/orders"><PackageCheck size={16}/> My Orders</a>
        <a role="menuitem" href="/wishlist"><Heart size={16}/> My Wishlist</a>
        <a role="menuitem" href="/account/addresses"><MapPin size={16}/> Addresses</a>
        <div className="account-dropdown-divider"/>
        <button role="menuitem" className="account-signout" onClick={signOut} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16}/> : <LogOut size={16}/>} Sign Out</button>
      </> : <>
        <a role="menuitem" href="/account/login"><LogIn size={16}/> Sign In</a>
        <a role="menuitem" href="/account/signup"><UserRound size={16}/> Create Account</a>
        <a role="menuitem" href="/account/orders"><PackageCheck size={16}/> My Orders</a>
        <a role="menuitem" href="/wishlist"><Heart size={16}/> My Wishlist</a>
      </>}
    </div>}
  </div>;
}
