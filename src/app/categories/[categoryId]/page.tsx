import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getCategory, getProducts, getSubcategories } from "@/lib/api";
import { CatalogProductGrid } from "@/components/catalog-product-grid";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }): Promise<Metadata> {
  try { const { categoryId } = await params; const category = await getCategory(categoryId); return { title: category.name }; }
  catch { return { title: "Category" }; }
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  if (!/^[a-f\d]{24}$/i.test(categoryId)) notFound();

  const [categoryResult, subcategoryResult, productsResult] = await Promise.allSettled([
    getCategory(categoryId),
    getSubcategories(categoryId),
    getProducts({ category: categoryId, limit: 40, page: 1, sort: "-ratingsAverage" }),
  ]);
  if (categoryResult.status === "rejected") notFound();

  const category = categoryResult.value;
  let subcategories = subcategoryResult.status === "fulfilled" ? subcategoryResult.value : [];
  if (subcategories.length === 0) {
    try {
      const allSubcategories = await getSubcategories();
      subcategories = allSubcategories.filter(subcategory => {
        const parentId = typeof subcategory.category === "string" ? subcategory.category : subcategory.category?._id ?? subcategory.categoryId;
        return parentId === categoryId;
      });
    } catch {
      // Keep the category page usable if the broader subcategory list is unavailable.
    }
  }
  const firstProductPage = productsResult.status === "fulfilled" ? productsResult.value : null;
  const remainingProductPages = firstProductPage && firstProductPage.pages > 1
    ? await Promise.allSettled(Array.from({ length: firstProductPage.pages - 1 }, (_, index) =>
      getProducts({ category: categoryId, limit: 40, page: index + 2, sort: "-ratingsAverage" }),
    ))
    : [];
  const categoryProducts = firstProductPage
    ? [...firstProductPage.products, ...remainingProductPages.flatMap(result => result.status === "fulfilled" ? result.value.products : [])]
    : [];
  const productSubcategoryIds = new Set(categoryProducts.flatMap(product => {
    const refs = [product.subcategory, product.subCategory, product.subcategories].flatMap(value => Array.isArray(value) ? value : value ? [value] : []);
    return refs.map(ref => typeof ref === "string" ? ref : ref?._id).filter((id): id is string => Boolean(id));
  }));
  const populatedSubcategories = await Promise.all(subcategories.map(async subcategory => {
    if (productSubcategoryIds.has(subcategory._id)) return subcategory;
    try {
      const result = await getProducts({ category: subcategory._id, limit: 1, page: 1 });
      return result.total > 0 ? subcategory : null;
    } catch {
      return null;
    }
  }));
  const recommendations = categoryProducts.slice(0, 8);

  return <main className="catalog-page wrap category-detail-page">
    <div className="catalog-breadcrumb"><a href="/">Home</a><span>/</span><a href="/categories">Categories</a><span>/</span><b>{category.name}</b></div>

    <header className="category-detail-heading">
      <span className="eyebrow">BROWSE CATEGORY</span>
      <h1>{category.name}</h1>
    </header>

    {populatedSubcategories.some(Boolean) && <section className="category-subcategories" aria-labelledby="category-subcategories-title">
      <div className="section-heading"><div><span className="eyebrow">EXPLORE WITHIN {category.name.toUpperCase()}</span><h2 id="category-subcategories-title">Subcategories</h2></div></div>
      <div className="category-subcategory-grid">
        {populatedSubcategories.flatMap(subcategory => subcategory ? [
          <a className="category-subcategory-card" href={`/categories/${category._id}/${subcategory._id}`} key={subcategory._id}>
            <span className="category-subcategory-image">{subcategory.image ? <Image src={subcategory.image} alt="" fill sizes="90px" unoptimized/> : <span>{subcategory.name.slice(0, 1).toUpperCase()}</span>}</span>
            <span className="category-subcategory-copy"><b>{subcategory.name}</b><small>Browse products</small></span>
            <ArrowRight size={18}/>
          </a>,
        ] : [])}
      </div>
    </section>}

    <section className="category-recommendations" aria-labelledby="category-recommendations-title">
      <div className="section-heading"><div><span className="eyebrow">PICKS FROM THIS CATEGORY</span><h2 id="category-recommendations-title">Recommended for you</h2></div></div>
      {recommendations.length > 0 ? <CatalogProductGrid products={recommendations}/> : <div className="category-empty-products" role="status"><span>🧺</span><b>No products in this category yet.</b></div>}
    </section>
  </main>;
}
