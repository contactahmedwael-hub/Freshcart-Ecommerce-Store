import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
export type OrderProduct = { title?: string; image?: string; imageCover?: string; images?: string[] };
export type OrderLine = { count?: number; price?: number; product?: OrderProduct | string };
export type Order = { _id: string; id?: string; orderNumber?: string; createdAt?: string; totalOrderPrice?: number; totalOrderPriceAfterDiscount?: number; paymentMethodType?: string; isPaid?: boolean; isDelivered?: boolean; status?: string; cartItems?: OrderLine[]; orderItems?: OrderLine[]; items?: OrderLine[]; shippingAddress?: { city?: string } };
function parseOrders(payload: unknown): Order[] {
  const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const data = root.data; const nested = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const list = Array.isArray(payload) ? payload : Array.isArray(data) ? data : [root.orders, root.results, nested.orders, nested.results, nested.docs, nested.data].find(Array.isArray) as unknown[] | undefined;
  const single = !list && data && typeof data === "object" && (typeof nested._id === "string" || typeof nested.id === "string") ? [data] : undefined;
  return (list ?? single ?? []).flatMap(item => { if (!item || typeof item !== "object") return []; const order = item as Record<string, unknown>; const id = typeof order._id === "string" ? order._id : typeof order.id === "string" ? order.id : undefined; return id ? [{ ...order, _id: id } as Order] : []; });
}
type OrdersState = { orders: Order[]; loading: boolean; loaded: boolean; signedIn: boolean; error: string };
const initialState: OrdersState = { orders: [], loading: true, loaded: false, signedIn: true, error: "" };
export const fetchOrders = createAsyncThunk("orders/fetch", async (_, { rejectWithValue }) => {
  try { const response = await fetch("/api/orders", { cache: "no-store" }); const payload = await response.json().catch(() => ({})); if (response.status === 401) return { orders: [], signedIn: false }; if (!response.ok) return rejectWithValue(payload && typeof payload === "object" && typeof payload.message === "string" ? payload.message : "Could not load orders."); return { orders: parseOrders(payload), signedIn: true }; }
  catch { return rejectWithValue("Could not load orders."); }
});
const ordersSlice = createSlice({ name: "orders", initialState, reducers: {}, extraReducers: builder => {
  builder.addCase(fetchOrders.pending, state => { state.loading = !state.loaded; state.error = ""; });
  builder.addCase(fetchOrders.fulfilled, (state, action) => { state.orders = action.payload.orders; state.signedIn = action.payload.signedIn; state.loading = false; state.loaded = true; });
  builder.addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.loaded = true; state.error = String(action.payload ?? action.error.message ?? "Could not load orders."); });
} });
export default ordersSlice.reducer;
