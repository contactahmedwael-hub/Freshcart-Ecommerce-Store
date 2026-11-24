"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";
import { fetchCart } from "@/lib/cart-state";
import { fetchSession } from "@/lib/session-state";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const store = useRef<AppStore | null>(null);
  if (!store.current) store.current = makeStore();
  useEffect(() => { void store.current?.dispatch(fetchCart()); void store.current?.dispatch(fetchSession()); }, []);
  return <Provider store={store.current}>{children}</Provider>;
}
