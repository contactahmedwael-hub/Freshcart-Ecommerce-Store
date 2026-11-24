import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/lib/types";
type CatalogFilters = { keyword: string; category: string; brand: string; sort: string; minPrice: string; maxPrice: string };
type CatalogState = { products: Product[]; page: number; loading: boolean };
const initialState: CatalogState = { products: [], page: 1, loading: false };
export const loadMoreProducts = createAsyncThunk("catalog/loadMore", async ({ nextPage, filters }: { nextPage: number; filters: CatalogFilters }, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams({ page: String(nextPage), limit: "12" });
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    const response = await fetch(`/api/catalog/products?${query.toString()}`);
    const data = await response.json();
    if (!response.ok) return rejectWithValue(typeof data.message === "string" ? data.message : "Could not load more products.");
    return { page: nextPage, products: data.products as Product[] };
  } catch { return rejectWithValue("Could not load more products."); }
});
const catalogSlice = createSlice({ name: "catalog", initialState, reducers: {
  initializeCatalog(state, action: PayloadAction<{ products: Product[]; page: number }>) { state.products = action.payload.products; state.page = action.payload.page; },
}, extraReducers: builder => {
  builder.addCase(loadMoreProducts.pending, state => { state.loading = true; });
  builder.addCase(loadMoreProducts.fulfilled, (state, action) => { state.products = [...state.products, ...action.payload.products]; state.page = action.payload.page; state.loading = false; });
  builder.addCase(loadMoreProducts.rejected, state => { state.loading = false; });
} });
export const { initializeCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;
