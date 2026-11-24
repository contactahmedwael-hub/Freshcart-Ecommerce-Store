import Image from "next/image";
import { notFound } from "next/navigation";
import { getBrand, getProducts } from "@/lib/api";
import { CatalogProductGrid } from "@/components/catalog-product-grid";
import { brandStyle } from "@/lib/brand-theme";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ brandId: string }> }): Promise<Metadata> {
  try { const { brandId } = await params; const brand = await getBrand(brandId); return { title: brand.name }; }
  catch { return { title: "Brand" }; }
}

export default async function BrandPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  if (!/^[a-f\d]{24}$/i.test(brandId)) notFound();
  const [brandResult, productsResult] = await Promise.allSettled([getBrand(brandId), getProducts({ brand: brandId, limit: 12, page: 1, sort: "-ratingsAverage" })]);
  if (brandResult.status === "rejected") notFound();
  const brand = brandResult.value;
  const products = productsResult.status === "fulfilled" ? productsResult.value.products : [];
  return <main className="catalog-page wrap"><div className="catalog-breadcrumb"><a href="/">Home</a><span>/</span><a href="/brands">Brands</a><span>/</span><b>{brand.name}</b></div><header className="brand-banner" style={brandStyle(brand.name)}><div className="brand-banner-logo">{brand.image ? <Image src={brand.image} alt={`${brand.name} logo`} fill sizes="160px" unoptimized/> : brand.name.slice(0,1).toUpperCase()}</div><div><span className="eyebrow">FRESH PICKS FROM</span><h1>{brand.name}</h1><p>Explore the products we carry from {brand.name}.</p></div></header><section className="collection-section"><div className="section-heading"><div><span className="eyebrow">THE {brand.name.toUpperCase()} COLLECTION</span><h2>Shop this brand</h2></div><a className="text-link" href={`/shop?brand=${brandId}`}>View all results →</a></div><CatalogProductGrid products={products}/></section></main>;
}
