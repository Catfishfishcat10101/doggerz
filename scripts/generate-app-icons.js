/** @format */

// scripts/generate-app-icons.js
// Generate PNG PWA icons from the Doggerz SVG logo.

const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "public", "icons");
const SOURCE_SVG = path.join(ICONS_DIR, "doggerz-logo.svg");

const BG = "#020617"; // matches manifest background_color (slate-950)

async function renderIcon(size) {
  const svg = fs.readFileSync(SOURCE_SVG);

  // Keep a safe margin so the icon is maskable-friendly.
  const inner = Math.round(size * 0.86);
  const pad = Math.floor((size - inner) / 2);

  const mark = await sharp(svg, { density: 600 })
    .resize(inner, inner, { fit: "contain" })
    .png()
    .toBuffer();

  const outPath = path.join(ICONS_DIR, `doggerz-${size}.png`);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);

  return outPath;
}

async function main() {
  if (!fs.existsSync(SOURCE_SVG)) {
    console.error(`[Doggerz] Missing source SVG: ${SOURCE_SVG}`);
    process.exit(1);
  }

  fs.mkdirSync(ICONS_DIR, { recursive: true });

  const out180 = await renderIcon(180);
  const out192 = await renderIcon(192);
  const out512 = await renderIcon(512);

  console.log('[Doggerz] Generated icons:');
  console.log(' -', out180);
  console.log(" -", out192);
  console.log(" -", out512);
}

main().catch((err) => {
  console.error("[Doggerz] Icon generation failed:", err);
  process.exit(1);
});
