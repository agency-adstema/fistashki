import { build } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("🥜 Building Fistashki PWA...");

await build({
  root: __dirname,
  configFile: resolve(__dirname, "vite.config.js"),
});

console.log("✅ Build complete! Check the dist/ folder.");