// scripts/verify-webp-sprites.js
// Verify that for each PNG sprite in jackrussell folder there is a .webp sibling.
// Exits with non-zero status if missing files are found – useful for CI.

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../src/assets/sprites/jackrussell");

function listPngFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".png"));
}

function main() {
  const pngs = listPngFiles(SRC_DIR);
  if (!pngs.length) {
    console.error("No PNGs found in", SRC_DIR);
    process.exit(2);
  }

  const missing = [];
  for (const p of pngs) {
    const base = p.slice(0, -4); // remove .png
    const webp = base + ".webp";
    if (!fs.existsSync(path.join(SRC_DIR, webp))) {
      // ignore large background images (backyard) which are not sprite sheets
      if (base.toLowerCase().includes("backyard")) continue;
      missing.push({ png: p, expectedWebp: webp });
    }
  }

  if (missing.length) {
    console.error("Missing WebP siblings for the following PNGs:");
    for (const m of missing)
      console.error("-", m.png, "=> expected", m.expectedWebp);
    process.exit(1);
  }

  console.log("All PNG sprites have WebP siblings (or were ignored).");
  process.exit(0);
}

main();
