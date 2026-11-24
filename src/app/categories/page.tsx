import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategories().catch(() => []);
  return <main className="catalog-page wrap"><div className="catalog-breadcrumb"><a href="/">Home</a><span>/</span><b>Categories</b></div><header className="catalog-heading"><span className="eyebrow">BROWSE YOUR WAY</span><h1>Shop by category</h1><p>Start with a department and explore its collections.</p></header>{categories.length ? <div className="directory-grid category-directory">{categories.map((category, index)=><a className="directory-card" href={`/categories/${category._id}`} key={category._id}><div className={`directory-card-image tint-${index%6}`}>{category.image ? <Image src={category.image} alt="" fill sizes="(max-width: 680px) 40vw, 220px" unoptimized/> : <span>{["🥑","🍓","🥕","🥛","🥐","🫒"][index%6]}</span>}</div><div><b>{category.name}</b><small>Explore products and subcategories</small></div><ArrowRight size={17}/></a>)}</div> : <div className="empty-state"><h3>Categories are temporarily unavailable</h3><a href="/shop" className="primary-button">Browse all products</a></div>}</main>;
}
