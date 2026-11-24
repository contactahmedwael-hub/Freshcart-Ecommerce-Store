import { CartPage } from "@/components/cart-page";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Cart" };
export default function CartRoute() { return <CartPage/>; }
