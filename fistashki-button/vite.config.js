import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: __dirname,
  base: "/fistashki/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
  server: {
    port: 9090,
    strictPort: true,
    host: "0.0.0.0",
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      includeAssets: ["icon-512.png"],
      manifestFilename: "manifest.json",
      manifest: {
        name: "Fistashki",
        short_name: "Fistashki",
        description: "Свежие фисташки напрямую от производителя — перейти на Fistashki.org",
        theme_color: "#4a7c3f",
        background_color: "#4a7c3f",
        display: "standalone",
        scope: "/",
        start_url: "/fistashki/",
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
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        navigateFallback: "/offline.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
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