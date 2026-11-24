import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
export type Address = { _id: string; name: string; details: string; phone: string; city: string };
function extractAddresses(payload: unknown): Address[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>; const data = root.data;
  const list = Array.isArray(data) ? data : data && typeof data === "object" ? ((data as Record<string, unknown>).addresses ?? (data as Record<string, unknown>).results) : undefined;
  return Array.isArray(list) ? list.filter((value): value is Address => !!value && typeof value === "object" && typeof (value as Address)._id === "string") : [];
}
function getMessage(payload: unknown, fallback: string) { return payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" ? payload.message : fallback; }
type AddressesState = { addresses: Address[]; loading: boolean; loaded: boolean; signedIn: boolean; busy: string; error: string };
const initialState: AddressesState = { addresses: [], loading: true, loaded: false, signedIn: true, busy: "", error: "" };
export const fetchAddresses = createAsyncThunk("addresses/fetch", async (_, { rejectWithValue }) => {
  try { const response = await fetch("/api/addresses", { cache: "no-store" }); const payload = await response.json().catch(() => ({})); if (response.status === 401) return { addresses: [], signedIn: false }; if (!response.ok) return rejectWithValue(getMessage(payload, "Could not load your addresses.")); return { addresses: extractAddresses(payload), signedIn: true }; }
  catch { return rejectWithValue("Could not load your addresses."); }
});
export const addAddress = createAsyncThunk("addresses/add", async (address: Omit<Address, "_id">, { dispatch, rejectWithValue }) => {
  try { const response = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(address) }); const payload = await response.json().catch(() => ({})); if (!response.ok) return rejectWithValue(getMessage(payload, "Could not save this address.")); await dispatch(fetchAddresses()).unwrap(); return getMessage(payload, "Your address has been saved."); }
  catch (error) { return rejectWithValue(typeof error === "string" ? error : "Could not save this address."); }
});
export const removeAddress = createAsyncThunk("addresses/remove", async (id: string, { rejectWithValue }) => {
  try { const response = await fetch(`/api/addresses/${encodeURIComponent(id)}`, { method: "DELETE" }); const payload = await response.json().catch(() => ({})); if (!response.ok) return rejectWithValue(getMessage(payload, "Could not remove this address.")); return id; }
  catch { return rejectWithValue("Could not remove this address."); }
});
const addressesSlice = createSlice({ name: "addresses", initialState, reducers: {}, extraReducers: builder => {
  builder.addCase(fetchAddresses.pending, state => { state.loading = !state.loaded; state.error = ""; });
  builder.addCase(fetchAddresses.fulfilled, (state, action) => { state.addresses = action.payload.addresses; state.signedIn = action.payload.signedIn; state.loading = false; state.loaded = true; });
  builder.addCase(fetchAddresses.rejected, (state, action) => { state.loading = false; state.loaded = true; state.error = String(action.payload ?? action.error.message ?? "Could not load addresses."); });
  builder.addCase(addAddress.pending, state => { state.busy = "add"; });
  builder.addCase(addAddress.fulfilled, state => { state.busy = ""; });
  builder.addCase(addAddress.rejected, (state, action) => { state.busy = ""; state.error = String(action.payload ?? action.error.message ?? "Could not save this address."); });
  builder.addCase(removeAddress.pending, (state, action) => { state.busy = action.meta.arg; });
  builder.addCase(removeAddress.fulfilled, (state, action) => { state.busy = ""; state.addresses = state.addresses.filter(address => address._id !== action.payload); });
  builder.addCase(removeAddress.rejected, (state, action) => { state.busy = ""; state.error = String(action.payload ?? action.error.message ?? "Could not remove this address."); });
} });
export default addressesSlice.reducer;
