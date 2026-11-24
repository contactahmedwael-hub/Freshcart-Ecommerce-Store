import type { Metadata } from "next";
import "./globals.css";
import "./figma-theme.css";
import "./catalog.css";
import "./responsive.css";
import { Header } from "@/components/header";
import { ToastProvider } from "@/components/toast-provider";
import { ReduxProvider } from "@/components/redux-provider";
export const metadata: Metadata = {
  title: { default: "FreshCart", template: "FreshCart | %s" },
  description: "Fresh groceries and everyday essentials delivered to your door.",
  manifest: "/manifest.json",
  themeColor: "#0eaa50",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
  },
  appleWebApp: { capable: true, title: "FreshCart", statusBarStyle: "default" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><ReduxProvider><ToastProvider/><Header/>{children}<footer className="footer"><div className="wrap footer-inner"><div className="footer-main"><div className="footer-brand"><a className="brandmark" href="/">fresh<span>cart</span></a><p>Fresh choices for happier days. Shop everyday essentials and market favorites, delivered with care.</p><span className="footer-promise">Fresh picks · Easy delivery · Here to help</span></div><nav className="footer-links" aria-label="Shop"><h2>Shop</h2><a href="/shop">All products</a><a href="/categories">Browse categories</a><a href="/brands">Our brands</a></nav><nav className="footer-links" aria-label="Your account"><h2>Your account</h2><a href="/account">Account settings</a><a href="/account/orders">Order history</a><a href="/wishlist">Wishlist</a></nav><div className="footer-links footer-contact"><h2>Need a hand?</h2><a href="/account">Visit your account</a><a href="/cart">Help with your cart</a><span>+1 800 555 0199</span></div></div><div className="footer-bottom"><span>© 2026 FreshCart. All rights reserved.</span><span>Made for your everyday market.</span></div></div></footer></ReduxProvider></body></html>; }
