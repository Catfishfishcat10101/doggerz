<<<<<<< HEAD
// scripts/split-backyard.js
// Split a combined backyard image into day/night halves.
// Usage:
//   node scripts/split-backyard.js <input> <outDay> <outNight>
// Example:
//   node scripts/split-backyard.js public/assets/backgrounds/backyard-split.png \
//     public/assets/backgrounds/backyard-day.png public/assets/backgrounds/backyard-night.png

const path = require("path");
const fs = require("fs");
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error(
    "sharp is required to run this script. Install with `npm install sharp --save-dev`",
  );
  process.exit(1);
}

function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const [input, outDay, outNight] = process.argv.slice(2);

  if (!input || !outDay || !outNight) {
    console.error(
      "Usage: node scripts/split-backyard.js <input> <outDay> <outNight>",
=======
/**
 * scripts/split-backyard.js
 *
 *   Splits a composite backyard image into day/night halves.
 *
 *   Usage:
 *     node scripts/split-backyard.js <inputComposite> <outputDay> <outputNight>
 *
 *   Example:
 *     node scripts/split-backyard.js public/backgrounds/backyard-split.png \
 *       public/backgrounds/backyard-day.png public/backgrounds/backyard-night.png
 *
 * @format
 */

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const [, , inputPath, outDayPath, outNightPath] = process.argv;

  if (!inputPath || !outDayPath || !outNightPath) {
    console.error(
      'Usage: node scripts/split-backyard.js <inputComposite> <outputDay> <outputNight>'
>>>>>>> master
    );
    process.exit(1);
  }

<<<<<<< HEAD
  if (!fs.existsSync(input)) {
    console.error("Missing input image:", input);
    process.exit(1);
  }

  const img = sharp(input);
  const meta = await img.metadata();

  if (!meta.width || !meta.height) {
    console.error("Could not read image dimensions:", input);
    process.exit(1);
  }

  const halfW = Math.floor(meta.width / 2);
  if (halfW <= 0) {
    console.error("Input image width too small to split:", meta.width);
    process.exit(1);
  }

  // left half = day, right half = night
  ensureParentDir(outDay);
  ensureParentDir(outNight);

  await sharp(input)
    .extract({ left: 0, top: 0, width: halfW, height: meta.height })
    .png()
    .toFile(outDay);

  await sharp(input)
    .extract({ left: halfW, top: 0, width: meta.width - halfW, height: meta.height })
    .png()
    .toFile(outNight);

  console.log("Wrote:");
  console.log(" -", outDay);
  console.log(" -", outNight);
}

main().catch((err) => {
  console.error("split-backyard failed:", err);
=======
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const img = sharp(inputPath);
  const meta = await img.metadata();

  if (!meta.width || !meta.height) {
    console.error('Could not read image dimensions.');
    process.exit(1);
  }

  const halfWidth = Math.floor(meta.width / 2);

  if (halfWidth <= 0) {
    console.error('Invalid composite image width.');
    process.exit(1);
  }

  // Ensure output directories exist
  for (const p of [outDayPath, outNightPath]) {
    const dir = path.dirname(p);
    if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
  }

  // Left half = day, right half = night
  await sharp(inputPath)
    .extract({ left: 0, top: 0, width: halfWidth, height: meta.height })
    .toFile(outDayPath);

  await sharp(inputPath)
    .extract({
      left: meta.width - halfWidth,
      top: 0,
      width: halfWidth,
      height: meta.height,
    })
    .toFile(outNightPath);

  console.log('Wrote:');
  console.log(`  Day:   ${outDayPath}`);
  console.log(`  Night: ${outNightPath}`);
}

main().catch((err) => {
  console.error(err);
>>>>>>> master
  process.exit(1);
});
