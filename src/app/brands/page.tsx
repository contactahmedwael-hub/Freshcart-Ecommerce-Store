import { getBrands } from "@/lib/api";
import { BrandDirectory } from "@/components/brand-directory";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await getBrands().catch(() => []);
  return <main className="catalog-page wrap"><div className="catalog-breadcrumb"><a href="/">Home</a><span>/</span><b>Brands</b></div><header className="catalog-heading"><span className="eyebrow">GOOD COMPANY</span><h1>Brands we love</h1><p>Find your favorites and discover something new.</p></header>{brands.length ? <BrandDirectory brands={brands}/> : <div className="empty-state"><h3>Brands are temporarily unavailable</h3><a className="primary-button" href="/shop">Browse products</a></div>}</main>;
}
