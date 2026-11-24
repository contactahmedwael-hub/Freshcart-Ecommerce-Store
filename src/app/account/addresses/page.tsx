import { AddressManager } from "@/components/address-manager";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Delivery Addresses" };
export default function AddressesPage() { return <AddressManager/>; }
