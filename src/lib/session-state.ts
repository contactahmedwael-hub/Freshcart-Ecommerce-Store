import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { clearCartOnSignOut } from "@/lib/cart-state";
type SessionPayload = { user?: { _id?: string; id?: string; name?: string; email?: string; phone?: string }; data?: { user?: { _id?: string; id?: string; name?: string; email?: string; phone?: string }; decoded?: { id?: string; name?: string; email?: string } }; decoded?: { id?: string; name?: string; email?: string } };
export type SessionUser = { id?: string; name: string; email?: string; phone?: string };
type SessionState = { user: SessionUser | null; status: "idle" | "loading" | "authenticated" | "unauthenticated"; signingOut: boolean };
const initialState: SessionState = { user: null, status: "idle", signingOut: false };
function parseSession(value: SessionPayload): SessionUser | null {
  const user = value.user ?? value.data?.user;
  const decoded = value.decoded ?? value.data?.decoded;
  const name = user?.name ?? decoded?.name;
  if (!name && !user?.email && !decoded?.email) return null;
  return { id: user?._id ?? user?.id ?? decoded?.id, name: name ?? "My account", email: user?.email ?? decoded?.email, phone: user?.phone };
}
export const fetchSession = createAsyncThunk("session/fetch", async () => {
  const response = await fetch("/api/auth/verify-token", { cache: "no-store" });
  if (!response.ok) return null;
  return parseSession(await response.json() as SessionPayload);
});
export const signOut = createAsyncThunk("session/signOut", async (_, { dispatch }) => {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Could not sign out. Please try again.");
  dispatch(clearCartOnSignOut());
});
const sessionSlice = createSlice({ name: "session", initialState, reducers: {}, extraReducers: builder => {
  builder.addCase(fetchSession.pending, state => { state.status = "loading"; });
  builder.addCase(fetchSession.fulfilled, (state, action) => { state.user = action.payload; state.status = action.payload ? "authenticated" : "unauthenticated"; });
  builder.addCase(fetchSession.rejected, state => { state.user = null; state.status = "unauthenticated"; });
  builder.addCase(signOut.pending, state => { state.signingOut = true; });
  builder.addCase(signOut.fulfilled, state => { state.user = null; state.status = "unauthenticated"; state.signingOut = false; });
  builder.addCase(signOut.rejected, state => { state.signingOut = false; });
} });
export default sessionSlice.reducer;
