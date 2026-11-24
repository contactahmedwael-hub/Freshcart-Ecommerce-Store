import "server-only";
import type { Product } from "@/lib/types";
import { callAuthApi, wishlistProducts } from "@/lib/auth-server";

export async function loadWishlist(token: string) {
  const response = await callAuthApi("/wishlist", { method: "GET", token });
  return { ok: response.ok, status: response.status, message: typeof response.result.message === "string" ? response.result.message : "Could not load your wishlist.", products: wishlistProducts(response.result) as unknown as Product[] };
}
