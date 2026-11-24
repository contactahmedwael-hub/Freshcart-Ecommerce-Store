import "server-only";
import type { ApiResult, Brand, Category, CatalogFilters, Product } from "@/lib/types";
import { isProductSoldOut } from "@/lib/product-pricing";
const API_BASE = process.env.FRESHCART_API_BASE ?? "https://ecommerce.routemisr.com/api/v1";
async function request<T>(path: string, revalidate = 60): Promise<T> { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000); try { const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal, next: { revalidate } }); if (!response.ok) throw new Error(`Catalog request failed (${response.status})`); return await response.json() as T; } finally { clearTimeout(timer); } }
function queryString(values: Record<string, string | number | undefined>) { const params = new URLSearchParams(); for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== "") params.set(key, String(value)); return params.size ? `?${params.toString()}` : ""; }
export async function getCategories() { const r = await request<ApiResult<Category[]>>("/categories?limit=100"); return r.data ?? []; }
export async function getBrands() { const r = await request<ApiResult<Brand[]>>("/brands?limit=100"); return r.data ?? []; }
export async function getSubcategories(categoryId?: string) { const endpoint = categoryId ? `/categories/${encodeURIComponent(categoryId)}/subcategories` : "/subcategories"; const r = await request<ApiResult<Category[]>>(endpoint); return r.data ?? []; }
export async function getProducts(filters: CatalogFilters = {}) {
  const { minPrice, maxPrice, category, keyword, page = 1, limit = 12, ...rest } = filters;
  const baseQuery = { ...rest, ...(minPrice !== undefined ? { "price[gte]": minPrice } : {}), ...(maxPrice !== undefined ? { "price[lte]": maxPrice } : {}), ...(category ? { "category[in]": category } : {}) };

  // The upstream keyword filter is inconsistent across product fields. When a
  // shopper searches, load the full filtered catalog and match locally so a
  // product on a later API page can still be found.
  if (keyword?.trim()) {
    const scanLimit = 40;
    const first = await request<ApiResult<Product[]>>(`/products${queryString({ ...baseQuery, page: 1, limit: scanLimit })}`);
    const pageCount = Math.max(1, first.metadata?.numberOfPages ?? 1);
    const remaining = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) =>
      request<ApiResult<Product[]>>(`/products${queryString({ ...baseQuery, page: index + 2, limit: scanLimit })}`),
    ));
    const needle = keyword.trim().toLocaleLowerCase();
    const terms = needle.split(/\s+/).filter(Boolean);
    const allProducts = [...(first.data ?? []), ...remaining.flatMap(result => result.data ?? [])];
    const matched = allProducts.filter(product => {
      const searchable = [product.title, product.description, product.brand?.name, product.category?.name]
        .filter(Boolean).join(" ").toLocaleLowerCase();
      return terms.every(term => searchable.includes(term));
    });
    const availableFirst = matched.filter(product => !isProductSoldOut(product));
    const soldOutLast = matched.filter(isProductSoldOut);
    const prioritizedMatches = [...availableFirst, ...soldOutLast];
    const pages = Math.max(1, Math.ceil(prioritizedMatches.length / limit));
    const currentPage = Math.min(page, pages);
    return { products: prioritizedMatches.slice((currentPage - 1) * limit, currentPage * limit), page: currentPage, pages, total: prioritizedMatches.length };
  }

  const q = queryString({ ...baseQuery, page, limit });
  const r = await request<ApiResult<Product[]>>(`/products${q}`);
  return { products: r.data ?? [], page: r.metadata?.currentPage ?? 1, pages: r.metadata?.numberOfPages ?? 1, total: r.results ?? r.data?.length ?? 0 };
}
export async function getProduct(id: string) { const r = await request<ApiResult<Product>>(`/products/${encodeURIComponent(id)}`); return r.data; }
export async function getCategory(id: string) { const r = await request<ApiResult<Category>>(`/categories/${encodeURIComponent(id)}`); return r.data; }
export async function getBrand(id: string) { const r = await request<ApiResult<Brand>>(`/brands/${encodeURIComponent(id)}`); return r.data; }
