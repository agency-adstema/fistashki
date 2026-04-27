import sharp from "sharp";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const size = 512;

// Proper pistachio icon SVG
const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5a9a3f"/>
      <stop offset="100%" stop-color="#3d6b2a"/>
    </linearGradient>
    <linearGradient id="nut" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4a853"/>
      <stop offset="100%" stop-color="#b8923a"/>
    </linearGradient>
    <linearGradient id="nutInner" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8fbc6a"/>
      <stop offset="100%" stop-color="#6d9a4a"/>
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <rect width="${size}" height="${size}" rx="100" fill="url(#bg)"/>

  <!-- Pistachio shell - outer -->
  <ellipse cx="256" cy="240" rx="110" ry="150" fill="url(#nut)"
    transform="rotate(-15, 256, 240)"/>

  <!-- Pistachio shell - inner cutout -->
  <ellipse cx="270" cy="235" rx="75" ry="130" fill="url(#nutInner)"
    transform="rotate(-15, 270, 235)"/>

  <!-- Shell crack line -->
  <path d="M240 150 Q280 240 230 340" stroke="#8b6914" stroke-width="4" fill="none" opacity="0.5"/>

  <!-- Small highlight/shine -->
  <ellipse cx="300" cy="200" rx="20" ry="30" fill="white" opacity="0.15"
    transform="rotate(-15, 300, 200)"/>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(size, size)
  .png()
  .toFile(resolve(__dirname, "public", "icon-512.png"));

console.log("✅ Fistashki icon generated!");