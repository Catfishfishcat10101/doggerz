#!/usr/bin/env node
/**
 * Split a side-by-side composite backyard image into day/night PNGs.
 *
 * Usage:
 *   node scripts/split-backyard.js input.png out-day.png out-night.png
 *
 * Notes:
 * - Requires `sharp` to be installed: npm i -D sharp
 * - Input is expected to be a 2:1 composition (left=day, right=night).
 */

const fs = require("fs");
const path = require("path");

async function main() {
  const [input, outDay, outNight] = process.argv.slice(2);
  if (!input || !outDay || !outNight) {
    console.error(
      "Usage: node scripts/split-backyard.js input.png out-day.png out-night.png",
    );
    process.exit(1);
  }

  let sharp;
  try {
    sharp = require("sharp");
  } catch (e) {
    console.error(
      "\nThis script requires the `sharp` package. Install it first:",
    );
    console.error("  npm install -D sharp\n");
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Input not found: ${input}`);
    process.exit(1);
  }

  const img = sharp(input);
  const meta = await img.metadata();
  const { width, height } = meta;
  if (!width || !height) {
    console.error("Unable to read image dimensions.");
    process.exit(1);
  }

  const half = Math.floor(width / 2);

  // Left half → day
  await img.extract({ left: 0, top: 0, width: half, height }).toFile(outDay);

  // Right half → night
  await sharp(input)
    .extract({ left: half, top: 0, width: width - half, height })
    .toFile(outNight);

  console.log(`Wrote:\n- ${path.resolve(outDay)}\n- ${path.resolve(outNight)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
