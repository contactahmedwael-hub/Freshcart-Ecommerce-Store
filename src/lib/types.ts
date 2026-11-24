export interface Category { _id: string; name: string; slug?: string; image?: string; category?: Category | string; categoryId?: string; }
export interface Brand { _id: string; name: string; slug?: string; image?: string; }
export interface Product { _id: string; title: string; slug?: string; description?: string; quantity?: number; price: number; priceAfterDiscount?: number; imageCover: string; images?: string[]; ratingsAverage?: number; ratingsQuantity?: number; brand?: Brand; category?: Category; subcategory?: Category | Category[] | string | string[]; subcategories?: Category[]; subCategory?: Category | Category[] | string | string[]; subCategoryId?: string; }
export interface ApiResult<T> { data: T; results?: number; metadata?: { currentPage: number; numberOfPages: number; limit: number; }; }
export interface CatalogFilters { page?: number; limit?: number; keyword?: string; sort?: string; fields?: string; brand?: string; category?: string; minPrice?: number; maxPrice?: number; }
