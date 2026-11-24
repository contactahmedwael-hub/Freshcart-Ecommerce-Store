import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };

// The checkout API returns successful payments to /allorders. Forward the
// browser to the authenticated customer's own order history page.
export default function AllOrdersCheckoutReturnPage() {
  redirect("/account/orders?placed=online");
}
