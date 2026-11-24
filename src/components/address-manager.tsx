"use client";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MapPin, Plus, Trash2, LoaderCircle } from "lucide-react";
import { addressSchema, validationMessage } from "@/lib/validation";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { addAddress as addAddressAction, fetchAddresses, removeAddress as removeAddressAction } from "@/lib/address-state";

export function AddressManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, loading, signedIn, busy: operation } = useSelector((state: RootState) => state.addresses);
  const busy = operation === "add";
  const removing = operation;
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { void dispatch(fetchAddresses()).unwrap().catch(error => toast.error(typeof error === "string" ? error : "Could not load your addresses.")); }, [dispatch]);
  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    const form = event.currentTarget;
    const body = Object.fromEntries(Array.from(new FormData(form).entries()).map(([key, value]) => [key, String(value).trim()]));
    try {
      const validation = addressSchema.safeParse(body);
      if (!validation.success) throw new Error(validationMessage(validation.error));
      const message = await dispatch(addAddressAction(validation.data)).unwrap();
      form.reset(); setNotice(message); toast.success(message);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not save this address."); }
  }
  async function removeAddress(id: string) {
    setError(""); setNotice("");
    try {
      await dispatch(removeAddressAction(id)).unwrap(); toast.success("Address removed.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not remove this address."); }
  }
  return <main className="address-page wrap"><a href="/account" className="back-link"><ArrowLeft size={15}/> Back to account</a><div className="address-heading"><div><span className="eyebrow">DELIVERY DETAILS</span><h1>Saved addresses</h1><p>Choose where your FreshCart orders should arrive.</p></div></div>
    {error && <p className="form-message error-message" role="alert">{error}</p>}{notice && <p className="form-message success-message" role="status">{notice}</p>}
    {loading ? <div className="account-loading"><LoaderCircle className="spin"/> Loading your addresses…</div> : !signedIn ? <section className="wishlist-state"><MapPin/><h2>Sign in to manage addresses.</h2><p>Your saved delivery details are private to your account.</p><a href="/account/login" className="primary-button">Sign in</a></section> : <div className="address-layout"><section className="account-card"><div className="account-card-title"><Plus/><div><h2>Add an address</h2><p>Save a delivery location to your account</p></div></div><form className="account-form" onSubmit={addAddress}><label className="auth-field">Address label<input name="name" placeholder="Home, Work…" required maxLength={50}/></label><label className="auth-field">City<input name="city" placeholder="City" required maxLength={80}/></label><label className="auth-field">Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" required maxLength={24}/></label><label className="auth-field">Address details<textarea name="details" placeholder="Street, building, apartment…" required maxLength={300}/></label><button className="primary-button" disabled={busy}>{busy?<><LoaderCircle className="spin" size={15}/> Saving…</>:"Save address"}</button></form></section><section className="saved-addresses"><div className="address-list-heading"><h2>Your addresses</h2><span>{addresses.length}</span></div>{addresses.length ? addresses.map(address=><article className="saved-address" key={address._id}><div className="saved-address-icon"><MapPin size={18}/></div><div className="saved-address-copy"><b>{address.name}</b><span>{address.details}</span><small>{address.city} · {address.phone}</small></div><button className="remove-address" onClick={()=>removeAddress(address._id)} disabled={!!removing} aria-label={`Remove ${address.name} address`} title="Remove address">{removing===address._id?<LoaderCircle className="spin" size={16}/>:<Trash2 size={16}/>}</button></article>) : <div className="address-empty"><MapPin/><b>No saved addresses yet</b><span>Add your first delivery address using the form.</span></div>}</section></div>}
  </main>;
}
