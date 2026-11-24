"use client";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";
import { addCartItem } from "@/lib/cart-state";

export function AddToCartButton({ productId, title, large = false, disabled = false }: { productId: string; title: string; large?: boolean; disabled?: boolean }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const busy = useSelector((state: RootState) => state.cart.busy === productId);
  async function add() {
    if (busy || disabled) return;
    try {
      await dispatch(addCartItem({ productId })).unwrap();
      toast.success(`${title} added to your cart.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add this item.");
    }
  }
  const unavailable = disabled;
  const busyLabel = busy ? `Adding ${title} to cart` : unavailable ? `${title} is sold out` : `Add ${title} to cart`;
  return <span className={`add-to-cart-wrap ${large ? "large-add-wrap" : ""}`}><button className={`${large ? "primary-button detail-add" : "add-button"}${unavailable ? " add-button-sold-out" : ""}`} onClick={add} disabled={busy || unavailable} aria-busy={busy} aria-label={busyLabel} title={busy ? "Adding to cart…" : unavailable ? "Sold out" : `Add ${title} to cart`}>{large && (unavailable ? "Sold out" : "Add to cart")}{busy ? <LoaderCircle className="spin" size={16}/> : unavailable && large ? null : <Plus size={17}/>}</button></span>;
}
