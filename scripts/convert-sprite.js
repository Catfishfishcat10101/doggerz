#!/usr/bin/env node
// scripts/convert-sprite.js
// Convert an uploaded sprite image into an optimized PNG sprite sheet
// Usage: place your source sprite (png/jpg/etc) at `assets/sprite-source.png`
// then run: `node scripts/convert-sprite.js`

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const SRC = path.resolve(__dirname, "../assets/sprite-source.png");
const OUT_DIR = path.resolve(__dirname, "../public/sprites");
const OUT = path.join(OUT_DIR, "jack_russell_puppy_sheet.png");

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Source file not found: ${SRC}`);
    console.error(
      "Place your uploaded sprite file at src/assets/sprite-source.png and re-run this script.",
    );
    process.exitCode = 2;
    return;
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  try {
    // Load source, convert to RGBA PNG and clamp to reasonable size if very large
    const image = sharp(SRC, { limitInputPixels: false }).png();

    // Optional: resize if larger than 2048 in either dimension
    const meta = await image.metadata();
    let pipeline = sharp(SRC);
    if (meta.width > 2048 || meta.height > 2048) {
      const scale = Math.min(2048 / meta.width, 2048 / meta.height);
      const w = Math.round(meta.width * scale);
      const h = Math.round(meta.height * scale);
      pipeline = pipeline.resize(w, h, { fit: "inside" });
      console.log(`Resizing source ${meta.width}x${meta.height} -> ${w}x${h}`);
    }

    // Convert and write optimized PNG
    await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(OUT);
    console.log("Wrote optimized sprite to:", OUT);
    console.log(
      "Replace any placeholder sprite path in your app if necessary.",
    );
  } catch (err) {
    console.error("Conversion failed:", err);
    process.exitCode = 1;
  }
}

main();
