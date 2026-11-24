import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, ArrowLeft, Truck } from "lucide-react";
import { getProduct } from "@/lib/api";
import { currentToken } from "@/lib/auth-server";
import { loadWishlist } from "@/lib/wishlist";
import { WishlistButton } from "@/components/wishlist-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductReviews } from "@/components/product-reviews";
import { hasProductDiscount, isProductSoldOut, productDiscountPercent } from "@/lib/product-pricing";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try { const { id } = await params; const product = await getProduct(id); return { title: product.title }; }
  catch { return { title: "Product" }; }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  try { product = await getProduct(id); } catch { notFound(); }
  if (!product) notFound();
  const token = await currentToken();
  let isWishlisted = false;
  if (token) {
    try { const wishlist = await loadWishlist(token); isWishlisted = wishlist.products.some(item => item._id === product._id); }
    catch { /* The product page remains available if wishlist data is unavailable. */ }
  }
  const soldOut = isProductSoldOut(product);
  const hasDiscount = hasProductDiscount(product);
  const price = hasDiscount ? product.priceAfterDiscount! : product.price;
  const discountPercent = productDiscountPercent(product);

  return <main className="detail wrap">
    <a className="back-link" href="/#products"><ArrowLeft size={15}/> Back to the good stuff</a>
    <div className="detail-layout">
      <div className="detail-photo"><Image src={product.imageCover} alt={product.title} fill priority sizes="(max-width:800px) 100vw, 50vw" unoptimized/>{soldOut && <span className="discount-badge sold-out-badge">Sold out</span>}</div>
      <div className="detail-copy">
        <span className="eyebrow">{product.category?.name ?? "FRESH PICK"}</span>
        <div className="detail-title-row"><h1>{product.title}</h1><WishlistButton productId={product._id} title={product.title} initialSelected={isWishlisted}/></div>
        <div className="rating detail-rating"><Star size={15} fill="currentColor"/><b>{product.ratingsAverage?.toFixed(1) ?? "4.8"}</b><span>({product.ratingsQuantity ?? 0} reviews)</span></div>
        <p>{product.description}</p>
        <div className="detail-price"><span>{soldOut ? "Sold out" : `$${price.toFixed(2)}`}</span>{hasDiscount && <><del>${product.price.toFixed(2)}</del><span className="discount-badge detail-discount-badge">{discountPercent}% OFF</span></>}</div>
        <p className={`stock${soldOut ? " stock-sold-out" : ""}`}>{soldOut ? "Sold out" : product.quantity && product.quantity > 0 ? "✓ In stock, ready for your basket" : "Check availability at checkout"}</p>
        <AddToCartButton productId={product._id} title={product.title} large disabled={soldOut}/>
        <div className="detail-delivery"><Truck size={18}/> Fresh delivery, right to your door</div>
      </div>
    </div>
    <ProductReviews productId={product._id} productTitle={product.title}/>
  </main>;
}
