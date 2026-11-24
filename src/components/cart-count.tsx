"use client";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
export function CartCount() {
  const count = useSelector((state: RootState) => state.cart.cart.itemCount);
  return count > 0 ? <b className="cart-count" aria-label={`${count} items in cart`}>{count > 99 ? "99+" : count}</b> : null;
}
