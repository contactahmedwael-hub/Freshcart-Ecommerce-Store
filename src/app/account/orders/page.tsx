import { OrderHistory } from "@/components/order-history";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order History" };
export default async function OrdersPage({searchParams}:{searchParams:Promise<{placed?:string}>}){const{placed}=await searchParams;return <OrderHistory placed={placed}/>;}
