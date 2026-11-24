import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { prioritizeInStockProducts } from "@/lib/product-pricing";

export function CatalogProductGrid({ products }: { products: Product[] }) {
  const prioritizedProducts = prioritizeInStockProducts(products);
  return products.length ? <div className="product-grid">{prioritizedProducts.map(product => <ProductCard product={product} key={product._id}/>)}</div> : <div className="empty-state"><span>🧺</span><h3>No products here yet</h3><p>Explore the shop to find more fresh picks.</p><a href="/shop" className="primary-button">Browse the shop</a></div>;
}
