"use client";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ClipboardList, CreditCard, Home, Info, LoaderCircle, LockKeyhole, MapPin, Plus, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { fetchCart } from "@/lib/cart-state";
import { fetchAddresses, type Address } from "@/lib/address-state";
import { cashShippingAddressSchema, shippingAddressSchema, validationMessage } from "@/lib/validation";
import { toast } from "react-toastify";
import { isProductSoldOut } from "@/lib/product-pricing";

const currency = (value: number) => `$${value.toFixed(2)}`;
type PaymentMethod = "cash" | "online";
function checkoutUrl(payload: unknown) {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : {};
  const session = root.session && typeof root.session === "object" ? root.session as Record<string, unknown> : data.session && typeof data.session === "object" ? data.session as Record<string, unknown> : {};
  return [session.url, data.url, root.url].find(value => typeof value === "string") as string | undefined;
}

export function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartState = useSelector((state: RootState) => state.cart);
  const addressState = useSelector((state: RootState) => state.addresses);
  const { cart, loading: cartLoading, signedIn } = cartState;
  const { addresses, loading: addressesLoading } = addressState;
  const hasSoldOutItems = cart.lines.some(line => isProductSoldOut(line.product) || line.price <= 0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { void dispatch(fetchCart()); void dispatch(fetchAddresses()); }, [dispatch]);
  useEffect(() => { if (!selectedAddress && addresses.length) setSelectedAddress(addresses[0]._id); }, [addresses, selectedAddress]);
  const isLoading = cartLoading || addressesLoading;
  const activeAddress = addresses.find(address => address._id === selectedAddress);

  function selectNewAddress() {
    setUseNewAddress(true);
    setSelectedAddress("");
  }
  function selectSavedAddress(address: Address) {
    setUseNewAddress(false);
    setSelectedAddress(address._id);
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasSoldOutItems) { toast.error("Remove sold-out products from your cart before placing an order."); return; }
    if (!cart.cartId) { toast.error("Your cart is not ready for checkout. Please return to your cart and try again."); return; }
    const form = event.currentTarget;
    const values = Object.fromEntries(Array.from(new FormData(form).entries()).map(([key, value]) => [key, String(value).trim()]));
    const rawAddress = useNewAddress
      ? { details: values.details ?? "", city: values.city ?? "", phone: values.phone ?? "" }
      : { details: activeAddress?.details ?? "", city: activeAddress?.city ?? "", phone: activeAddress?.phone ?? "" };
    const schema = payment === "cash" ? cashShippingAddressSchema : shippingAddressSchema;
    const validation = schema.safeParse(rawAddress);
    if (!validation.success) { toast.error(validationMessage(validation.error)); return; }
    setSubmitting(true);
    try {
      const path = payment === "cash" ? `/api/orders/cash/${encodeURIComponent(cart.cartId)}` : `/api/orders/checkout-session/${encodeURIComponent(cart.cartId)}`;
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingAddress: validation.data }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.message === "string" ? result.message : "Could not place your order.");
      if (payment === "cash") {
        toast.success("Your order has been placed.");
        void dispatch(fetchCart());
        router.push("/account/orders?placed=cash");
        router.refresh();
      } else {
        const url = checkoutUrl(result);
        if (!url) throw new Error("The payment service did not return a checkout link.");
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.hostname === "localhost")) throw new Error("The payment service returned an invalid checkout link.");
        window.location.assign(parsed.toString());
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not place your order."); }
    finally { setSubmitting(false); }
  }

  if (isLoading) return <main className="checkout-page wrap"><div className="account-loading"><LoaderCircle className="spin"/> Preparing your secure checkout…</div></main>;
  if (!signedIn) return <main className="checkout-page wrap"><section className="cart-empty"><LockKeyhole/><h2>Sign in to continue checkout</h2><p>Your cart and saved addresses are linked to your account.</p><a className="primary-button" href="/account/login">Sign in</a></section></main>;
  if (!cart.lines.length) return <main className="checkout-page wrap"><section className="cart-empty"><h2>Your cart is empty</h2><p>Add items before starting checkout.</p><a className="primary-button" href="/shop">Explore products</a></section></main>;

  const itemCount = cart.itemCount;
  const total = cart.discountedTotal ?? cart.total;
  const freeDelivery = total >= 50;
  const showSavedAddresses = addresses.length > 0 && !useNewAddress;
  return <main className="checkout-page wrap">
    <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/cart">Cart</a><span>/</span><b>Checkout</b></nav>
    <header className="checkout-page-heading"><div className="checkout-page-title"><span className="checkout-heading-icon"><ClipboardList size={31}/></span><div><h1>Complete Your Order</h1><p>Review your items and complete your purchase</p></div></div><a className="checkout-back-cart" href="/cart"><ArrowLeft size={18}/> Back to Cart</a></header>
    <form className="checkout-page-layout" onSubmit={placeOrder}>
      <div className="checkout-main-column">
        <section className="checkout-section-card">
          <header className="checkout-section-header"><h2><Home size={21} fill="currentColor"/> Shipping Address</h2><p>Where should we deliver your order?</p></header>
          <div className="checkout-section-content">
            {addresses.length > 0 && <div className="checkout-address-picker"><h3><MapPin size={17} fill="currentColor"/> Saved Addresses</h3><p>Select a saved address or enter a new one below</p>
              {showSavedAddresses && <div className="checkout-more-addresses">{addresses.map(address => <button type="button" key={address._id} className={`checkout-saved-address ${selectedAddress === address._id ? "selected" : ""}`} onClick={() => selectSavedAddress(address)}><span className="saved-address-pin"><MapPin size={17}/></span><span className="saved-address-details"><b>{address.name}</b><span>{address.details}</span><small><span>☎ {address.phone}</span><span>▦ {address.city}</span></small></span><span className={`checkout-radio ${selectedAddress === address._id ? "checked" : ""}`}>{selectedAddress === address._id && <Check size={13}/>}</span></button>)}</div>}
              {showSavedAddresses && <button type="button" className="checkout-new-address" onClick={selectNewAddress}><span><Plus size={22}/></span><span><b>Use a different address</b><small>Enter a new shipping address manually</small></span></button>}
            </div>}
            {useNewAddress || !addresses.length ? <div className="checkout-manual-address">
              <div className="checkout-info-box"><Info size={17} fill="currentColor"/><span><b>Delivery Information</b><small>Please ensure your address is accurate for smooth delivery</small></span></div>
              <label className="checkout-reference-field">City <em>*</em><span className="checkout-input-icon"><span>▦</span><input name="city" placeholder="e.g. Cairo, Alexandria, Giza" required autoComplete="address-level2"/></span></label>
              <label className="checkout-reference-field">Street Address <em>*</em><span className="checkout-input-icon checkout-textarea-wrap"><MapPin size={18}/><textarea name="details" placeholder="Street name, building number, floor, apartment…" required autoComplete="street-address"/></span></label>
              <label className="checkout-reference-field">Phone Number <em>*</em><span className="checkout-input-icon"><span>☎</span><input name="phone" type="tel" placeholder="Phone number" required autoComplete="tel"/></span></label>
              {addresses.length > 0 && <button type="button" className="checkout-use-saved" onClick={() => setUseNewAddress(false)}><ArrowLeft size={15}/> Choose a saved address</button>}
            </div> : <input type="hidden" name="savedAddress" value={selectedAddress}/>}
          </div>
        </section>

        <section className="checkout-section-card checkout-payment-section">
          <header className="checkout-section-header"><h2><CreditCard size={22} fill="currentColor"/> Payment Method</h2><p>Choose how you’d like to pay</p></header>
          <div className="checkout-payment-options">
            <button type="button" className={`checkout-payment-option ${payment === "cash" ? "selected" : ""}`} onClick={() => setPayment("cash")}><span className="payment-icon cash-payment"><Wallet size={24}/></span><span><b>Cash on Delivery</b><small>Pay when your order arrives at your doorstep</small></span><span className={`checkout-radio ${payment === "cash" ? "checked" : ""}`}>{payment === "cash" && <Check size={13}/>}</span></button>
            <button type="button" className={`checkout-payment-option ${payment === "online" ? "selected" : ""}`} onClick={() => setPayment("online")}><span className="payment-icon"><CreditCard size={23}/></span><span><b>Pay Online</b><small>Secure payment with Credit/Debit Card via Stripe</small><small className="payment-brands">VISA　● Mastercard　 AMEX</small></span><span className={`checkout-radio ${payment === "online" ? "checked" : ""}`}>{payment === "online" && <Check size={13}/>}</span></button>
          </div>
        </section>
      </div>

      <aside className="checkout-order-summary">
        <header><h2><LockKeyhole size={19} fill="currentColor"/> Order Summary</h2><p>{itemCount} {itemCount === 1 ? "item" : "items"}</p></header>
        <div className="checkout-summary-lines">{cart.lines.map(line => { const soldOut = isProductSoldOut(line.product) || line.price <= 0; return <div className="checkout-summary-product" key={line.product._id}><span className="checkout-summary-image"><Image src={line.product.imageCover} alt={line.product.title} fill sizes="70px" unoptimized/></span><span className="checkout-summary-product-info"><b>{line.product.title}</b><small className={soldOut ? "is-sold-out" : ""}>{soldOut ? "Sold out" : `${line.count} × ${currency(line.price)}`}</small></span><strong>{soldOut ? "Sold out" : currency(line.price * line.count)}</strong></div>; })}</div>
        <div className="checkout-summary-totals"><div><span>Subtotal</span><b>{currency(cart.total)}</b></div><div><span><Truck size={18}/> Shipping</span><b className={freeDelivery ? "free-shipping-label" : ""}>{freeDelivery ? "FREE" : "Calculated at checkout"}</b></div>{cart.discountedTotal !== undefined && cart.discountedTotal < cart.total && <div><span>Discount</span><b className="free-shipping-label">−{currency(cart.total-cart.discountedTotal)}</b></div>}<div className="checkout-grand-total"><span>Total</span><strong>{currency(total)} <small>USD</small></strong></div></div>
        <button type="submit" className="checkout-place-order" disabled={submitting || hasSoldOutItems}><LockKeyhole size={18} fill="currentColor"/>{submitting ? <><LoaderCircle className="spin" size={17}/> Placing your order…</> : hasSoldOutItems ? "Remove sold-out items" : "Place Order"}</button>
        <div className="checkout-trust-row"><span><ShieldCheck size={15}/> Secure</span><i/><span><Truck size={15}/> Fast Delivery</span><i/><span>▣ Easy Returns</span></div>
      </aside>
    </form>
  </main>;
}
