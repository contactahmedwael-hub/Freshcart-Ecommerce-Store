"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { cashShippingAddressSchema, shippingAddressSchema, validationMessage } from "@/lib/validation";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/store";
import { fetchCart } from "@/lib/cart-state";

type CheckoutMode = "cash" | "online";
function getCheckoutUrl(payload: unknown): string | undefined {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : {};
  const session = root.session && typeof root.session === "object" ? root.session as Record<string, unknown> : data.session && typeof data.session === "object" ? data.session as Record<string, unknown> : {};
  return [session.url, data.url, root.url].find(value => typeof value === "string") as string | undefined;
}

export function CheckoutActions({ cartId }: { cartId?: string }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [busy, setBusy] = useState<CheckoutMode | "">("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const mode = submitter?.value as CheckoutMode;
    if (mode !== "cash" && mode !== "online") return;
    setError("");
    const formData = new FormData(form);
    const shippingAddress = {
      details: String(formData.get("details") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      ...(mode === "cash" ? { postalCode: String(formData.get("postalCode") ?? "").trim() } : {}),
    };
    const validation = (mode === "cash" ? cashShippingAddressSchema : shippingAddressSchema).safeParse(shippingAddress);
    if (!validation.success) { toast.error(validationMessage(validation.error)); return; }
    setBusy(mode);
    try {
      if (!cartId) throw new Error("The cart API did not return a cart ID. Please refresh your cart and try again.");
      const path = mode === "cash"
        ? `/api/orders/cash/${encodeURIComponent(cartId)}`
        : `/api/orders/checkout-session/${encodeURIComponent(cartId)}`;
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingAddress: validation.data }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.message === "string" ? payload.message : "Could not start checkout.");
      if (mode === "cash") {
        void dispatch(fetchCart());
        router.push("/account/orders?placed=cash");
        router.refresh();
        return;
      }
      const url = getCheckoutUrl(payload);
      if (!url) throw new Error("The checkout service did not return a payment link.");
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.hostname === "localhost")) throw new Error("The payment service returned an invalid checkout link.");
      window.location.assign(parsed.toString());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout.");
    } finally {
      setBusy("");
    }
  }

  return <form className="checkout-actions" onSubmit={submit}>
    <h3>Delivery address</h3>
    <label className="checkout-field">Address details<input name="details" required maxLength={300} placeholder="Street, building, apartment"/></label>
    <div className="checkout-field-row">
      <label className="checkout-field">City<input name="city" required maxLength={80} placeholder="City"/></label>
      <label className="checkout-field">Phone<input name="phone" required type="tel" maxLength={24} placeholder="Phone"/></label>
    </div>
    <label className="checkout-field">Postal code <span>(cash orders)</span><input name="postalCode" maxLength={16} placeholder="Postal code"/></label>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    <button className="primary-button checkout-order-button" name="mode" value="cash" disabled={!!busy || !cartId}>{busy === "cash" ? <><LoaderCircle className="spin" size={15}/> Placing order…</> : "Place cash order"}</button>
    <button className="secondary-checkout-button" name="mode" value="online" disabled={!!busy || !cartId}>{busy === "online" ? <><LoaderCircle className="spin" size={15}/> Opening secure checkout…</> : "Pay online"}</button>
    <p className="checkout-note">Online payment is securely handled by the checkout provider.</p>
  </form>;
}
