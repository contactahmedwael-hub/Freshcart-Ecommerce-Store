"use client";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Brand, Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

type ShopFilters = { keyword: string; category: string; brand: string; sort: string; minPrice: string; maxPrice: string };
type Props = { products: Product[]; page: number; pages: number; total: number; categories: Category[]; brands: Brand[]; filters: ShopFilters };

function pageNumbers(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function ShopCatalog({ products, page, pages, total, categories, brands, filters }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    if (!filtersOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [filtersOpen]);

  function pageHref(target: number) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value && !(key === "sort" && value === "-createdAt")) params.set(key, value); });
    if (target > 1) params.set("page", String(target));
    return `/shop${params.size ? `?${params.toString()}` : ""}`;
  }

  return <div className={`shop-layout${filtersOpen ? " filters-open" : ""}`}>
    <button className="mobile-filter-backdrop" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}/>
    <aside className="shop-filters" id="shop-filters" aria-label="Product filters">
      <div className="shop-filter-title"><SlidersHorizontal size={17}/><h2>Find your picks</h2><button className="mobile-filter-close" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={20}/></button></div>
      <form action="/shop" method="get" className="shop-filter-form">
        <label>Search<input name="keyword" defaultValue={filters.keyword} placeholder="What are you looking for?"/></label>
        <label>Category<select name="category" defaultValue={filters.category}><option value="">All categories</option>{categories.map(item=><option value={item._id} key={item._id}>{item.name}</option>)}</select></label>
        <label>Brand<select name="brand" defaultValue={filters.brand}><option value="">All brands</option>{brands.map(item=><option value={item._id} key={item._id}>{item.name}</option>)}</select></label>
        <label>Sort by<select name="sort" defaultValue={filters.sort}><option value="-createdAt">Newest</option><option value="-ratingsAverage">Top rated</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option></select></label>
        <div className="shop-price-fields"><label>Min price<input name="minPrice" inputMode="decimal" type="number" min="0" step="0.01" defaultValue={filters.minPrice} placeholder="0"/></label><label>Max price<input name="maxPrice" inputMode="decimal" type="number" min="0" step="0.01" defaultValue={filters.maxPrice} placeholder="Any"/></label></div>
        <button className="primary-button">Apply filters</button>
      </form>
    </aside>
    <section className="shop-results">
      <div className="shop-results-meta"><p>{total} products to explore <span>{products.length} shown</span></p><button className="mobile-filter-trigger" type="button" aria-controls="shop-filters" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16}/> Filters</button></div>
      {products.length ? <>
        <div className="product-grid">{products.map(product=><ProductCard product={product} key={product._id}/>)}</div>
        {pages > 1 && <nav className="shop-pagination" aria-label="Product pages">
          {page > 1 ? <Link className="pagination-arrow" href={pageHref(page - 1)} aria-label="Previous page"><ChevronLeft size={20}/></Link> : <span className="pagination-arrow is-disabled" aria-disabled="true"><ChevronLeft size={20}/></span>}
          {pageNumbers(page, pages).map(number => <Link key={number} className={`pagination-number${number === page ? " is-current" : ""}`} href={pageHref(number)} aria-current={number === page ? "page" : undefined}>{number}</Link>)}
          {page < pages ? <Link className="pagination-arrow" href={pageHref(page + 1)} aria-label="Next page"><ChevronRight size={20}/></Link> : <span className="pagination-arrow is-disabled" aria-disabled="true"><ChevronRight size={20}/></span>}
        </nav>}
      </> : <div className="empty-state"><span>🧺</span><h3>No products match those filters</h3><p>Try a different category, brand, or price range.</p><a className="primary-button" href="/shop">Clear filters</a></div>}
    </section>
  </div>;
}
