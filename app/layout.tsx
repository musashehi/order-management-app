import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Orders",
  description: "Simple order management for small stores"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
