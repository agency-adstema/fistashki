import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: __dirname,
  server: {
    host: "127.0.0.1",
    port: 8081,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-512.png"],
      manifestFilename: "manifest.json",
      manifest: {
        name: "Fistashki — Sveže pistaće",
        short_name: "Fistashki",
        description: "Sveže pistaće direktno od proizvođača",
        theme_color: "#4a7c3f",
        background_color: "#f5f0e8",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/offline.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});