import Image from "next/image";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { WishlistButton } from "@/components/wishlist-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { hasProductDiscount, isProductSoldOut, productDiscountPercent } from "@/lib/product-pricing";

export function ProductCard({ product, isWishlisted = false, refreshOnWishlistToggle = false }: { product: Product; isWishlisted?: boolean; refreshOnWishlistToggle?: boolean }) {
  const soldOut = isProductSoldOut(product);
  const hasDiscount = hasProductDiscount(product);
  const price = hasDiscount ? product.priceAfterDiscount! : product.price;
  const discountPercent = productDiscountPercent(product);

  return <article className="product-card">
    <WishlistButton productId={product._id} title={product.title} initialSelected={isWishlisted} refreshOnToggle={refreshOnWishlistToggle}/>
    <a className="product-image" href={`/products/${product._id}`}>
      <Image src={product.imageCover} alt={product.title} fill sizes="(max-width: 680px) 45vw, (max-width: 1100px) 30vw, 220px" unoptimized/>
      {soldOut ? <span className="discount-badge sold-out-badge">Sold out</span> : hasDiscount && <span className="discount-badge" aria-label={`${discountPercent}% off`}>{discountPercent}% OFF</span>}
    </a>
    <div className="product-info">
      <small>{product.brand?.name ?? product.category?.name ?? "FreshCart pick"}</small>
      <a className="product-title" href={`/products/${product._id}`}>{product.title}</a>
      <div className="rating"><Star size={13} fill="currentColor"/><b>{product.ratingsAverage?.toFixed(1) ?? "4.8"}</b><span>({product.ratingsQuantity ?? 0})</span></div>
      <div className="price-row"><strong className={soldOut ? "sold-out-price" : ""}>{soldOut ? "Sold out" : `$${price.toFixed(2)}`}</strong>{hasDiscount && <del>${product.price.toFixed(2)}</del>}<AddToCartButton productId={product._id} title={product.title} disabled={soldOut}/></div>
    </div>
  </article>;
}
