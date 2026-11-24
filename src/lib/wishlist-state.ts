import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
type WishlistState = { selected: string[]; hydrated: string[]; busy: string[] };
const initialState: WishlistState = { selected: [], hydrated: [], busy: [] };
export const toggleWishlist = createAsyncThunk("wishlist/toggle", async ({ productId, selected }: { productId: string; selected: boolean }, { rejectWithValue }) => {
  try {
    const response = await fetch(selected ? `/api/wishlist/${encodeURIComponent(productId)}` : "/api/wishlist", { method: selected ? "DELETE" : "POST", headers: selected ? undefined : { "Content-Type": "application/json" }, ...(selected ? {} : { body: JSON.stringify({ productId }) }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return rejectWithValue(payload && typeof payload === "object" && typeof payload.message === "string" ? payload.message : "Could not update your wishlist.");
    return { productId, selected: !selected };
  } catch { return rejectWithValue("Could not update your wishlist."); }
});
const wishlistSlice = createSlice({ name: "wishlist", initialState, reducers: {
  initializeWishlistItem(state, action: PayloadAction<{ productId: string; selected: boolean }>) {
    const { productId, selected } = action.payload;
    if (state.hydrated.includes(productId)) return;
    state.hydrated.push(productId);
    state.selected = selected ? [...new Set([...state.selected, productId])] : state.selected.filter(id => id !== productId);
  },
}, extraReducers: builder => {
  builder.addCase(toggleWishlist.pending, (state, action) => { if (!state.busy.includes(action.meta.arg.productId)) state.busy.push(action.meta.arg.productId); });
  builder.addCase(toggleWishlist.fulfilled, (state, action) => { const { productId, selected } = action.payload; state.busy = state.busy.filter(id => id !== productId); state.hydrated.push(productId); state.selected = selected ? [...new Set([...state.selected, productId])] : state.selected.filter(id => id !== productId); });
  builder.addCase(toggleWishlist.rejected, (state, action) => { state.busy = state.busy.filter(id => id !== action.meta.arg.productId); });
} });
export const { initializeWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
