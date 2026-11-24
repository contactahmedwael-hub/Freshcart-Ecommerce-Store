import { Heart, ArrowLeft } from "lucide-react";
import { currentToken } from "@/lib/auth-server";
import { loadWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const token = await currentToken();
  if (!token) return <main className="wishlist-page wrap"><a href="/" className="back-link"><ArrowLeft size={15}/> Back to FreshCart</a><section className="wishlist-state"><Heart/><span className="eyebrow">YOUR SAVED PICKS</span><h1>Your wishlist is waiting.</h1><p>Sign in to save products and keep your favorites close.</p><a href="/account/login" className="primary-button">Sign in to your account</a></section></main>;
  const wishlist = await loadWishlist(token);
  if (!wishlist.ok) return <main className="wishlist-page wrap"><a href="/" className="back-link"><ArrowLeft size={15}/> Back to FreshCart</a><section className="wishlist-state"><Heart/><h1>We couldn’t load your wishlist.</h1><p>{wishlist.message}</p><a href="/account/login" className="primary-button">Check your account</a></section></main>;
  return <main className="wishlist-page wrap"><a href="/" className="back-link"><ArrowLeft size={15}/> Back to FreshCart</a><div className="section-heading"><div><span className="eyebrow">YOUR SAVED PICKS</span><h1>My wishlist</h1></div><span className="wishlist-count">{wishlist.products.length} {wishlist.products.length === 1 ? "favorite" : "favorites"}</span></div>{wishlist.products.length ? <div className="product-grid">{wishlist.products.map(product => <ProductCard key={product._id} product={product} isWishlisted refreshOnWishlistToggle/>)}</div> : <section className="wishlist-state"><Heart/><h2>Your wishlist is waiting.</h2><p>Tap the heart on anything you love and it’ll show up here.</p><a href="/#products" className="primary-button">Explore fresh picks</a></section>}</main>;
}
