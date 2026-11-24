import { AccountPanel } from "@/components/account-panel";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "My Account" };
export default function AccountPage() { return <AccountPanel/>; }
