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
    );
    process.exit(1);
  }

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
  process.exit(1);
});
