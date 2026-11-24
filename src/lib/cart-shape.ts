import type { Product } from "@/lib/types";
export type CartLine = { product: Product; count: number; price: number };
export type CartSnapshot = { cartId?: string; lines: CartLine[]; total: number; discountedTotal?: number; coupon?: string; itemCount: number };
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
const numeric = (value: unknown): number | undefined => typeof value === "number" && Number.isFinite(value) ? value : undefined;

export function parseCart(payload: unknown): CartSnapshot {
  const root = record(payload); const data = record(root.data ?? payload);
  const rawLines = Array.isArray(root.data) ? root.data : data.cartItems ?? data.products ?? data.items ?? data.cart ?? [];
  const lines: CartLine[] = Array.isArray(rawLines) ? rawLines.flatMap((value: unknown) => {
    const item = record(value); const candidate = record(item.product ?? item);
    if (typeof candidate._id !== "string" || typeof candidate.title !== "string") return [];
    const product = candidate as unknown as Product;
    const countValue = numeric(item.count ?? item.quantity) ?? 1;
    const price = numeric(item.price) ?? product.priceAfterDiscount ?? product.price ?? 0;
    return [{ product, count: Math.max(1, Math.floor(countValue)), price }];
  }) : [];
  const totalFromApi = numeric(data.totalCartPrice ?? data.totalPrice ?? root.totalCartPrice);
  const discountedTotal = numeric(data.totalAfterDiscount ?? data.discountedTotal ?? root.totalAfterDiscount);
  return {
    ...(typeof data._id === "string" ? { cartId: data._id } : typeof data.cartId === "string" ? { cartId: data.cartId } : {}),
    lines,
    total: totalFromApi ?? lines.reduce((sum, line) => sum + line.price * line.count, 0),
    ...(discountedTotal === undefined ? {} : { discountedTotal }),
    coupon: typeof data.coupon === "string" ? data.coupon : typeof record(data.coupon).name === "string" ? String(record(data.coupon).name) : undefined,
    itemCount: lines.reduce((sum, line) => sum + line.count, 0),
  };
}
