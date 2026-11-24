# FreshCart

FreshCart is a responsive e-commerce storefront for groceries and everyday essentials. Customers can browse and search products, explore categories and brands, manage a wishlist and shopping cart, and complete checkout with a saved or new delivery address.

## Features

- Product discovery with search, category, brand, price, and sort filters
- Eight products per Shop page, with numbered pagination
- Category, subcategory, and brand browsing
- Product discounts and sold-out indicators
- Account registration, sign-in, password recovery, and password updates
- Persistent cart, quantity controls, coupon entry, and wishlist
- Saved delivery addresses and order history
- Checkout with cash on delivery or online payment through the configured API
- Responsive layouts for desktop and mobile

## Tech stack

- **Next.js 15** with the App Router
- **React 19** and **TypeScript**
- **Redux Toolkit** and **React Redux** for client-side cart, catalog, session, address, and wishlist state
- **Tailwind CSS 4** with custom CSS for the storefront design
- **Zod** for validating form and API input
- **Lucide React** for icons
- **React Toastify** for notifications
- **RouteMisr E-Commerce API** for catalog, account, address, cart, and order data

## Project structure

```text
src/
  app/          App Router pages and server-side API routes
  components/   Storefront, account, cart, and checkout UI
  lib/          API clients, state management, validation, and shared helpers
```

The browser communicates with the app's `/api` routes for account and order operations. Those server routes call the configured e-commerce API and keep the authentication token in an HTTP-only cookie.

## Integration notes

- The Google and Facebook buttons are currently visual options only. Social sign-in requires OAuth endpoints and provider credentials from the backend.
- Online checkout requires the API to return a secure payment URL. The app only redirects to HTTPS payment links (localhost is allowed during development).
- Product imagery is loaded from the configured API; the Next.js image configuration currently allows the RouteMisr API host.

