"use client";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, LoaderCircle, Minus, Plus, ShoppingCart, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { updateCart } from "@/lib/cart-state";
import { couponSchema, validationMessage } from "@/lib/validation";
import { toast } from "react-toastify";
import { isProductSoldOut } from "@/lib/product-pricing";

const currency = (value: number) => `$${value.toFixed(2)}`;

export function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, signedIn, busy } = useSelector((state: RootState) => state.cart);
  const [coupon, setCoupon] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);
  const [error, setError] = useState("");

  async function mutate(path: string, method: "PUT" | "DELETE", body?: unknown, success?: string) {
    setError("");
    try {
      await dispatch(updateCart({ path, method, body })).unwrap();
      if (success) toast.success(success);
    } catch (e) {
      const message = typeof e === "string" ? e : e instanceof Error ? e.message : "Could not update your cart.";
      setError(message); toast.error(message);
    }
  }
  async function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = couponSchema.safeParse({ couponName: coupon });
    if (!validation.success) { toast.error(validationMessage(validation.error)); return; }
    setCouponBusy(true);
    await mutate("/api/cart/coupon", "PUT", validation.data, "Coupon applied.");
    setCouponBusy(false);
  }
  async function clearCart() {
    if (window.confirm("Remove every item from your cart?")) await mutate("/api/cart", "DELETE", undefined, "Your cart has been cleared.");
  }

  const itemCount = cart.itemCount;
  const total = cart.discountedTotal ?? cart.total;
  const qualifiesForFreeDelivery = total >= 50;
  const freeDeliveryRemainder = Math.max(0, 50 - total);

  return <main className="cart-page wrap">
    <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><b>Shopping Cart</b></nav>
    <header className="cart-page-heading">
      <div className="cart-page-title"><span className="cart-heading-icon"><ShoppingCart size={30} fill="currentColor"/></span><div><h1>Shopping Cart</h1><p>You have <strong>{itemCount} {itemCount === 1 ? "item" : "items"}</strong> in your cart</p></div></div>
    </header>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    {loading ? <div className="account-loading"><LoaderCircle className="spin"/> Loading your cart…</div>
      : !signedIn ? <section className="cart-empty"><ShoppingBag/><h2>Sign in to see your cart.</h2><p>Your cart is saved to your account.</p><a className="primary-button" href="/account/login">Sign in</a></section>
      : !cart.lines.length ? <section className="cart-empty"><ShoppingBag/><h2>Your cart is empty</h2><p>Find something fresh and add it to your bag.</p><a className="primary-button" href="/shop">Explore products</a></section>
      : <div className="cart-layout cart-reference-layout">
        <section className="cart-main-column">
          <div className="cart-lines cart-reference-lines">
            {cart.lines.map(line => {
              const id = line.product._id;
              const lineBusy = busy.includes(id);
              const soldOut = isProductSoldOut(line.product) || line.price <= 0;
              const image = line.product.imageCover;
              const category = line.product.category?.name ?? line.product.brand?.name ?? "FreshCart pick";
              return <article className="cart-line cart-reference-line" key={id}>
                <a className="cart-line-image cart-reference-image" href={`/products/${id}`}><Image src={image} alt={line.product.title} fill sizes="128px" unoptimized/></a>
                <div className="cart-line-info cart-reference-info">
                  <a href={`/products/${id}`}><b>{line.product.title}</b></a>
                  <div className="cart-product-meta"><span className="cart-category-pill">{category}</span><span>SKU: {id.slice(-6).toUpperCase()}</span></div>
                  <div className={`cart-unit-price cart-reference-unit ${soldOut ? "cart-sold-out-price" : ""}`}>{soldOut ? "Sold out" : <>{currency(line.price)} <small>per unit</small></>}</div>
                  <span className={`cart-stock ${soldOut ? "out-of-stock" : ""}`}>{soldOut ? null : <Check size={12} />}{soldOut ? "Sold out" : "In Stock"}</span>
                </div>
                <div className="quantity-stepper cart-reference-stepper">
                  <button aria-label="Decrease quantity" disabled={line.count <= 1 || !!busy || lineBusy} onClick={() => mutate(`/api/cart/${id}`, "PUT", { count: line.count - 1 })}><Minus size={15}/></button>
                  <span>{line.count}</span>
                  <button aria-label="Increase quantity" disabled={soldOut || line.count >= 99 || !!busy || lineBusy} onClick={() => mutate(`/api/cart/${id}`, "PUT", { count: line.count + 1 })}>{lineBusy ? <LoaderCircle className="spin" size={15}/> : <Plus size={16}/>}</button>
                </div>
                <div className="cart-reference-total"><small>Total</small><strong className={soldOut ? "cart-sold-out-price" : ""}>{soldOut ? "Sold out" : currency(line.price * line.count)}</strong></div>
                <button className="remove-cart-line cart-reference-remove" aria-label={`Remove ${line.product.title}`} title="Remove item" disabled={lineBusy || !!busy} onClick={() => mutate(`/api/cart/${id}`, "DELETE", undefined, "Item removed from cart.")}>{lineBusy ? <LoaderCircle className="spin" size={16}/> : <Trash2 size={17}/>}</button>
              </article>;
            })}
          </div>
          <div className="cart-list-footer"><a href="/shop"><ArrowLeft size={16}/> Continue Shopping</a><button className="clear-cart" onClick={clearCart} disabled={!!busy}><Trash2 size={15}/> Clear all items</button></div>
        </section>

        <aside className="cart-summary cart-reference-summary">
          <div className="cart-summary-header"><h2><LockKeyhole size={18} fill="currentColor"/> Order Summary</h2><p>{itemCount} {itemCount === 1 ? "item" : "items"} in your cart</p></div>
          <div className={`free-delivery-banner ${qualifiesForFreeDelivery ? "qualified" : ""}`}><span><Truck size={19} fill="currentColor"/></span><div><b>{qualifiesForFreeDelivery ? "Free Shipping!" : "Free delivery on orders over $50"}</b><small>{qualifiesForFreeDelivery ? "You qualify for free delivery" : `Add ${currency(freeDeliveryRemainder)} to qualify for free delivery`}</small></div></div>
          <div className="cart-reference-rows"><div className="summary-row"><span>Subtotal</span><b>{currency(cart.total)}</b></div>
            {cart.discountedTotal !== undefined && cart.discountedTotal < cart.total && <div className="summary-row discount-row"><span>Discount</span><b>−{currency(cart.total - cart.discountedTotal)}</b></div>}
            <div className="summary-row"><span>Shipping</span><b className={qualifiesForFreeDelivery ? "free-shipping-label" : ""}>{qualifiesForFreeDelivery ? "FREE" : "Calculated at checkout"}</b></div>
            <div className="summary-total"><span>Total</span><strong>{currency(total)}</strong></div>
          </div>
          <div className="cart-promo-area">
            <button className="cart-promo-toggle" type="button" onClick={() => setCouponOpen(value => !value)} aria-expanded={couponOpen}><Tag size={16} fill="currentColor"/> Apply Promo Code</button>
            {couponOpen && <form className="coupon-form cart-reference-coupon" onSubmit={applyCoupon}><div><input aria-label="Promo code" value={coupon} onChange={event => setCoupon(event.target.value)} placeholder="Enter promo code"/><button disabled={couponBusy || !!busy || !coupon.trim()}>{couponBusy ? <LoaderCircle className="spin" size={15}/> : "Apply"}</button></div></form>}
          </div>
          <a className="cart-secure-checkout" href="/checkout"><LockKeyhole size={17} fill="currentColor"/> Secure Checkout <ArrowRight size={17}/></a>
          <div className="cart-trust-row"><span><ShieldCheck size={14}/> Secure Payment</span><i/><span><Truck size={14}/> Fast Delivery</span></div>
          <a className="cart-summary-continue" href="/shop"><ArrowLeft size={15}/> Continue Shopping</a>
        </aside>
      </div>}
  </main>;
}
