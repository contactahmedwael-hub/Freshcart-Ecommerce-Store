import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/lib/cart-state";
import wishlistReducer from "@/lib/wishlist-state";
import catalogReducer from "@/lib/catalog-state";
import sessionReducer from "@/lib/session-state";
import ordersReducer from "@/lib/orders-state";
import addressesReducer from "@/lib/address-state";

export function makeStore() {
  return configureStore({ reducer: { cart: cartReducer, wishlist: wishlistReducer, catalog: catalogReducer, session: sessionReducer, orders: ordersReducer, addresses: addressesReducer } });
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
