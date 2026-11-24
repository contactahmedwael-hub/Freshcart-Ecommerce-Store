import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { parseCart, type CartSnapshot } from "@/lib/cart-shape";

type CartState = { cart: CartSnapshot; signedIn: boolean; loading: boolean; loaded: boolean; busy: string; error: string };
const emptyCart: CartSnapshot = { lines: [], total: 0, itemCount: 0 };
const initialState: CartState = { cart: emptyCart, signedIn: true, loading: true, loaded: false, busy: "", error: "" };

function message(payload: unknown, fallback: string) {
  return payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" ? payload.message : fallback;
}

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/cart", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) return { cart: emptyCart, signedIn: false };
    if (!response.ok) return rejectWithValue(message(payload, "Could not load your cart."));
    return { cart: parseCart(payload), signedIn: true };
  } catch { return rejectWithValue("Could not load your cart."); }
});

export const addCartItem = createAsyncThunk("cart/add", async ({ productId }: { productId: string }, { dispatch, rejectWithValue }) => {
  try {
    const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return rejectWithValue(message(payload, "Could not add this item to your cart."));
    await dispatch(fetchCart()).unwrap();
    return productId;
  } catch { return rejectWithValue("Could not add this item to your cart."); }
});

export const updateCart = createAsyncThunk("cart/update", async ({ path, method, body }: { path: string; method: "PUT" | "DELETE"; body?: unknown }, { dispatch, rejectWithValue }) => {
  try {
    const response = await fetch(path, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return rejectWithValue(message(payload, "Could not update your cart."));
    await dispatch(fetchCart()).unwrap();
    return true;
  } catch { return rejectWithValue("Could not update your cart."); }
});

const cartSlice = createSlice({
  name: "cart", initialState, reducers: {
    clearCartOnSignOut(state) { state.cart = emptyCart; state.signedIn = false; state.loading = false; state.loaded = true; state.busy = ""; state.error = ""; },
  },
  extraReducers: builder => {
    builder.addCase(fetchCart.pending, state => { state.loading = !state.loaded; state.error = ""; });
    builder.addCase(fetchCart.fulfilled, (state, action) => { state.cart = action.payload.cart; state.signedIn = action.payload.signedIn; state.loading = false; state.loaded = true; });
    builder.addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.loaded = true; state.error = String(action.payload ?? action.error.message ?? "Could not load your cart."); });
    builder.addCase(addCartItem.pending, (state, action) => { state.busy = action.meta.arg.productId; state.error = ""; });
    builder.addCase(addCartItem.fulfilled, state => { state.busy = ""; });
    builder.addCase(addCartItem.rejected, (state, action) => { state.busy = ""; state.error = String(action.payload ?? action.error.message ?? "Could not add this item to your cart."); });
    builder.addCase(updateCart.pending, (state, action) => { state.busy = action.meta.arg.path; state.error = ""; });
    builder.addCase(updateCart.fulfilled, state => { state.busy = ""; });
    builder.addCase(updateCart.rejected, (state, action) => { state.busy = ""; state.error = String(action.payload ?? action.error.message ?? "Could not update your cart."); });
  },
});
export const { clearCartOnSignOut } = cartSlice.actions;
export default cartSlice.reducer;
export { emptyCart };
