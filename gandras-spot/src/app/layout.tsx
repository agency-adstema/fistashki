import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { HydrationGuard } from "@/components/HydrationGuard";
import { MenuBootstrap } from "@/components/menu/MenuBootstrap";
import { RestaurantBootstrap } from "@/components/menu/RestaurantBootstrap";
import { CookieBanner } from "@/components/legal/CookieBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gandraspot.rs"),
  title: {
    default: "Gandras Spot | Premium Burgeri",
    template: "%s | Gandras Spot",
  },
  description:
    "Premium burger restoran u Somboru. The taste that's hard to find. Poručite online — brza dostava ili lično preuzimanje.",
  openGraph: {
    title: "Gandras Spot | Premium Burgeri",
    description: "The taste that's hard to find.",
    type: "website",
    locale: "sr_RS",
    siteName: "Gandras Spot",
    images: [{ url: "/images/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full w-full max-w-[100dvw] flex-col overflow-x-clip bg-white text-black">
        <HydrationGuard>
          <MenuBootstrap />
          <RestaurantBootstrap />
          {children}
          <CookieBanner />
        </HydrationGuard>
      </body>
    </html>
  );
}
