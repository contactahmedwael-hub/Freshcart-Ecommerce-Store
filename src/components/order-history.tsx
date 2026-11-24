"use client";
import Image from "next/image";
import { useEffect } from "react";
import { CalendarDays, Clock3, LoaderCircle, MapPin, Package, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { fetchOrders, type Order, type OrderLine, type OrderProduct } from "@/lib/orders-state";
function formatMoney(value: number) { return `${new Intl.NumberFormat("en-EG", { maximumFractionDigits: 2 }).format(value)} EGP`; }
function shortOrderId(order: Order) { return order.orderNumber ?? order._id.slice(-6).toUpperCase(); }
function statusFor(order: Order) {
  const raw = order.status?.toLowerCase();
  if (order.isDelivered || raw === "delivered") return { label: "Delivered", tone: "delivered" };
  if (raw?.includes("cancel")) return { label: "Cancelled", tone: "cancelled" };
  if (raw?.includes("ship")) return { label: "Shipped", tone: "shipped" };
  return { label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Processing", tone: "processing" };
}
function lineProduct(line: OrderLine): OrderProduct | undefined { return line.product && typeof line.product === "object" ? line.product : undefined; }
function orderItemCount(order: Order) { return (order.cartItems ?? order.orderItems ?? order.items ?? []).reduce((sum, line) => sum + (line.count ?? 1), 0); }

export function OrderHistory({ placed }: { placed?: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, signedIn, error } = useSelector((state: RootState) => state.orders);
  useEffect(() => {
    if (placed === "cash") toast.success("Your cash order was placed successfully.");
    if (placed === "online") toast.success("Your payment was successful. Your order is confirmed.");
  }, [placed]);
  useEffect(() => { void dispatch(fetchOrders()).unwrap().catch(error => toast.error(typeof error === "string" ? error : "Could not load orders.")); }, [dispatch]);
  return <main className="orders-page wrap">
    <div className="orders-breadcrumb"><a href="/">Home</a><span>/</span><b>My Orders</b></div>
    <header className="orders-page-heading"><span className="orders-heading-icon"><ShoppingBag size={24}/></span><div><h1>My Orders</h1><p>Track and manage your {orders.length} {orders.length === 1 ? "order" : "orders"}</p></div></header>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    {loading ? <div className="account-loading"><LoaderCircle className="spin"/> Loading your orders…</div> : !signedIn ? <section className="cart-empty"><ShoppingBag/><h2>Sign in to view your orders.</h2><a className="primary-button" href="/account/login">Sign in</a></section> : orders.length ? <div className="orders-list">{orders.map(order => {
      const items = order.cartItems ?? order.orderItems ?? order.items ?? [];
      const firstProduct = items[0] ? lineProduct(items[0]) : undefined;
      const imageUrl = firstProduct?.imageCover ?? firstProduct?.image ?? firstProduct?.images?.[0];
      const total = order.totalOrderPriceAfterDiscount ?? order.totalOrderPrice ?? 0;
      const status = statusFor(order);
      const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recently";
      return <article className="order-card" key={order._id}>
        <div className="order-product-image">{imageUrl ? <Image src={imageUrl} alt={firstProduct?.title ?? "Order item"} fill sizes="120px" unoptimized/> : <ShoppingBag size={27}/>}</div>
        <div className="order-card-content">
          <div className={`order-status-badge ${status.tone}`}><Clock3 size={13}/>{status.label}</div>
          <b className="order-number"><span>#</span> {shortOrderId(order)}</b>
          <div className="order-details-line"><span><CalendarDays size={13}/>{date}</span><i>•</i><span><Package size={13}/>{orderItemCount(order)} {orderItemCount(order) === 1 ? "item" : "items"}</span>{order.shippingAddress?.city && <><i>•</i><span><MapPin size={13}/>{order.shippingAddress.city}</span></>}</div>
          {items.length > 1 && <span className="order-extra-items">{items.length} products in this order</span>}
          <div className="order-total">{formatMoney(total)}</div>
        </div>
      </article>;
    })}</div> : <section className="cart-empty"><ShoppingBag/><h2>No orders yet.</h2><p>When you place an order, it’ll show up here.</p><a href="/#products" className="primary-button">Explore products</a></section>}
  </main>;
}

