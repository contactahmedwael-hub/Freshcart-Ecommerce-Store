import type { Product } from "@/lib/types";

export function isProductSoldOut(product: Pick<Product, "price" | "priceAfterDiscount" | "quantity">) {
  if (product.quantity === 0 || product.price <= 0 || product.priceAfterDiscount === 0) return true;
  if (typeof product.priceAfterDiscount !== "number" || product.priceAfterDiscount >= product.price) return false;
  return Math.round((product.price - product.priceAfterDiscount) / product.price * 100) >= 100;
}

export function hasProductDiscount(product: Pick<Product, "price" | "priceAfterDiscount" | "quantity">) {
  return !isProductSoldOut(product)
    && typeof product.priceAfterDiscount === "number"
    && product.price > 0
    && product.priceAfterDiscount > 0
    && product.priceAfterDiscount < product.price;
}

export function productDiscountPercent(product: Pick<Product, "price" | "priceAfterDiscount" | "quantity">) {
  return hasProductDiscount(product)
    ? Math.round((product.price - product.priceAfterDiscount!) / product.price * 100)
    : 0;
}

export function prioritizeInStockProducts<T extends Pick<Product, "price" | "priceAfterDiscount" | "quantity">>(products: T[]) {
  return [...products.filter(product => !isProductSoldOut(product)), ...products.filter(isProductSoldOut)];
}
