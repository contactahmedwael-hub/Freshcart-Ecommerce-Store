import { getBrands, getCategories, getProducts } from "@/lib/api";
import { ShopCatalog } from "@/components/shop-catalog";
import type { CatalogFilters } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const keyword = first((await searchParams).keyword)?.trim();
  return { title: keyword ? `Search: ${keyword}` : "Shop" };
}

type Params = Record<string, string | string[] | undefined>;
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function price(value: string | undefined) { const number = Number(value); return value && Number.isFinite(number) && number >= 0 ? number : undefined; }
export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const filters = { keyword: first(params.keyword) ?? "", category: first(params.category) ?? "", brand: first(params.brand) ?? "", sort: first(params.sort) ?? "-createdAt", minPrice: first(params.minPrice) ?? "", maxPrice: first(params.maxPrice) ?? "" };
  const queryFilters: Omit<CatalogFilters, "page"> = { limit: 8, keyword: filters.keyword || undefined, category: filters.category || undefined, brand: filters.brand || undefined, sort: filters.sort || undefined, minPrice: price(filters.minPrice), maxPrice: price(filters.maxPrice) };
  const requestedPage = Math.max(1, Math.floor(Number(first(params.page)) || 1));
  const [catalogResult, categories, brands] = await Promise.allSettled([getProducts({ ...queryFilters, page: 1 }), getCategories(), getBrands()]);
  const failed = catalogResult.status === "rejected";
  const firstPage = failed ? { products: [], pages: 1, total: 0 } : catalogResult.value;
  const page = Math.min(requestedPage, firstPage.pages);
  const currentPageResult = page > 1 ? await getProducts({ ...queryFilters, page }) : firstPage;
  const products = currentPageResult.products;
  const categoryList = categories.status === "fulfilled" ? categories.value : [];
  const brandList = brands.status === "fulfilled" ? brands.value : [];
  return <main className="catalog-page wrap"><div className="catalog-breadcrumb"><a href="/">Home</a><span>/</span><b>Shop</b></div><header className="catalog-heading"><span className="eyebrow">THE FRESHCART MARKET</span><h1>Shop all products</h1><p>Browse the full collection, then narrow it down to exactly what you need.</p></header>{failed ? <div className="empty-state"><span>☁</span><h3>We couldn’t reach the market</h3><p>Product data is temporarily unavailable. Please try again shortly.</p></div> : <ShopCatalog products={products} page={page} pages={firstPage.pages} total={firstPage.total} categories={categoryList} brands={brandList} filters={filters}/>}</main>;
}
