import { CheckoutPage } from "@/components/checkout-page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutRoute() {
  return <CheckoutPage/>;
}
