import Image from "next/image";
import { ArrowRight, ArrowUpRight, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getBrands, getCategories, getProducts } from "@/lib/api";
import { currentToken } from "@/lib/auth-server";
import { loadWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";
import { prioritizeInStockProducts } from "@/lib/product-pricing";

export default async function Home() {
  const token = await currentToken();
  const [categoriesResult, brandsResult, productsResult, wishlistResult] = await Promise.allSettled([
    getCategories(), getBrands(), getProducts({ limit: 40, page: 1, sort: "-ratingsAverage" }),
    token ? loadWishlist(token) : Promise.resolve({ products: [] }),
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : [];
  const remainingPopularPages = productsResult.status === "fulfilled" && productsResult.value.pages > 1
    ? await Promise.allSettled(Array.from({ length: productsResult.value.pages - 1 }, (_, index) => getProducts({ limit: 40, page: index + 2, sort: "-ratingsAverage" })))
    : [];
  const allPopularProducts = productsResult.status === "fulfilled"
    ? [...productsResult.value.products, ...remainingPopularPages.flatMap(result => result.status === "fulfilled" ? result.value.products : [])]
    : [];
  const products = prioritizeInStockProducts(allPopularProducts).slice(0, 8);
  const wishlisted = wishlistResult.status === "fulfilled" ? new Set(wishlistResult.value.products.map(product => product._id)) : new Set<string>();
  return <main>
    <section className="hero wrap"><div className="hero-copy"><span className="eyebrow"><i/> FRESHNESS, DELIVERED</span><h1>Good food.<br/><em>Good mood.</em></h1><p>Fresh picks, everyday favorites, and all the little things that make home feel like home.</p><div className="hero-ctas"><a className="primary-button" href="/shop">Shop the market <ArrowRight size={16}/></a><span><b>★ ★ ★ ★ ★</b><small>Loved by everyday shoppers</small></span></div><div className="hero-note"><span className="note-icon"><Truck size={18}/></span><span><b>Fresh to your door</b><small>Thoughtful picks, easy checkout</small></span></div></div><div className="hero-art"><div className="hero-glow"/><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-blob"><Image src="/images/carousel-produce.png" alt="A colorful selection of fresh market produce" fill priority sizes="(max-width: 680px) 100vw, 54vw"/></div><div className="floating-tag tag-top"><span>✦</span><div><b>Picked for you</b><small>Fresh finds every day</small></div></div><div className="floating-tag tag-bottom"><div className="tiny-avatars">● ● ●</div><div><b>Goodness inside</b><small>Everyday favorites</small></div></div><span className="sparkle sparkle-a">✳</span><span className="sparkle sparkle-b">✦</span></div><span className="hero-index">01 <i/> 03</span></section>
    <section className="benefits"><div className="wrap benefit-grid"><Benefit icon={<Truck/>} title="Easy delivery" text="Convenient checkout"/><Benefit icon={<ShieldCheck/>} title="Quality picks" text="Products you'll love"/><Benefit icon={<RotateCcw/>} title="Easy returns" text="No fuss, no worries"/><Benefit icon={<Headphones/>} title="Here to help" text="Support when you need it"/></div></section>
    <section className="section wrap"><div className="section-heading"><div><span className="eyebrow">START WITH WHAT YOU NEED</span><h2>Shop by category</h2></div><a className="text-link" href="/categories">All categories <ArrowUpRight size={16}/></a></div>{categories.length ? <div className="category-grid">{categories.slice(0,6).map((category,index)=><a href={`/categories/${category._id}`} className={`category-tile tint-${index%6}`} key={category._id}><div className="category-image">{category.image?<Image src={category.image} alt="" fill sizes="160px" unoptimized/>:<span>{["🥑","🍓","🥕","🥛","🥐","🫒"][index%6]}</span>}</div><b>{category.name}</b><small>Explore collections <ArrowRight size={12}/></small></a>)}</div> : <div className="empty-state"><p>Categories are loading. You can still browse everything in the shop.</p><a href="/shop" className="text-link">Shop all products →</a></div>}</section>
    <section className="section products-section"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">A GOOD PLACE TO START</span><h2>Popular right now</h2></div><a className="text-link" href="/shop?sort=-ratingsAverage">Explore all products <ArrowUpRight size={16}/></a></div>{products.length ? <div className="product-grid">{products.map(product=><ProductCard product={product} key={product._id} isWishlisted={wishlisted.has(product._id)}/>)}</div> : <div className="empty-state"><h3>Popular picks are on their way</h3><a href="/shop" className="text-link">Browse the shop →</a></div>}</div></section>
    <section className="brand-section wrap"><div><span className="eyebrow">GOOD COMPANY</span><h2>Find your favorite brands</h2><a href="/brands" className="text-link">Explore all brands <ArrowRight size={15}/></a></div><div className="brand-list">{brands.slice(0,5).map(brand=><a className="brand-tile brand-home-card" href={`/brands/${brand._id}`} key={brand._id}><span className="brand-logo brand-tile-logo">{brand.image?<Image src={brand.image} alt={`${brand.name} logo`} fill sizes="(max-width: 680px) 42vw, 220px" unoptimized/>:brand.name.slice(0,1).toUpperCase()}</span><b>{brand.name}</b><span className="brand-home-link">View products <ArrowUpRight size={14}/></span></a>)}</div></section>
    <section className="newsletter wrap"><div><span className="eyebrow">A FRESH NOTE IN YOUR INBOX</span><h2>Good things are growing.</h2><p>Get seasonal picks, little treats, and new finds from FreshCart.</p></div><a className="primary-button" href="/shop">Find your next favorite <ArrowRight size={16}/></a><span className="newsletter-decoration">✳</span></section>
  </main>;
}
function Benefit({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="benefit">{icon}<span><b>{title}</b><small>{text}</small></span></div>;}
