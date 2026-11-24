import { notFound } from "next/navigation";
import { getCategory, getProducts, getSubcategories } from "@/lib/api";
import { CatalogProductGrid } from "@/components/catalog-product-grid";
import type { Product } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string; subcategoryId: string }> }): Promise<Metadata> {
  try {
    const { categoryId, subcategoryId } = await params;
    const subcategories = await getSubcategories(categoryId);
    return { title: subcategories.find(item => item._id === subcategoryId)?.name ?? "Subcategory" };
  } catch { return { title: "Subcategory" }; }
}

function subcategoryRefs(value: Product["subcategory"] | Product["subCategory"] | Product["subcategories"]) {
  const refs = Array.isArray(value) ? value : value ? [value] : [];
  return refs.flatMap(ref => typeof ref === "string" ? [ref] : ref && typeof ref._id === "string" ? [ref._id] : []);
}

export default async function SubcategoryPage({ params }: { params: Promise<{ categoryId: string; subcategoryId: string }> }) {
  const { categoryId, subcategoryId } = await params;
  if (![categoryId, subcategoryId].every(id => /^[a-f\d]{24}$/i.test(id))) notFound();

  const [parentResult, childrenResult, productsResult] = await Promise.allSettled([
    getCategory(categoryId),
    getSubcategories(categoryId),
    getProducts({ category: categoryId, limit: 40, page: 1, sort: "-ratingsAverage" }),
  ]);
  if (parentResult.status === "rejected" || childrenResult.status === "rejected") notFound();
  const subcategory = childrenResult.value.find(item => item._id === subcategoryId);
  if (!subcategory) notFound();
  const category = parentResult.value;

  const firstPage = productsResult.status === "fulfilled" ? productsResult.value : null;
  const remainingPages = firstPage && firstPage.pages > 1
    ? await Promise.allSettled(Array.from({ length: firstPage.pages - 1 }, (_, index) =>
      getProducts({ category: categoryId, limit: 40, page: index + 2, sort: "-ratingsAverage" }),
    ))
    : [];
  const categoryProducts = firstPage
    ? [...firstPage.products, ...remainingPages.flatMap(result => result.status === "fulfilled" ? result.value.products : [])]
    : [];
  const products = categoryProducts.filter(product => product.category?._id === subcategoryId || [
    ...subcategoryRefs(product.subcategory),
    ...subcategoryRefs(product.subCategory),
    ...subcategoryRefs(product.subcategories),
  ].includes(subcategoryId));

  return <main className="catalog-page wrap subcategory-products-page">
    <div className="catalog-breadcrumb"><a href="/">Home</a><span>/</span><a href="/categories">Categories</a><span>/</span><a href={`/categories/${category._id}`}>{category.name}</a><span>/</span><b>{subcategory.name}</b></div>
    <CatalogProductGrid products={products}/>
  </main>;
}
