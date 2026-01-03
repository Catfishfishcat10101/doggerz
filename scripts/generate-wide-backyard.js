/** @format */

/**
 * scripts/generate-wide-backyard.js
 *
 * Generates wide (landscape) backyard backgrounds from the existing portrait assets.
 * This is a pragmatic way to avoid the "portrait framed inside landscape" look.
 *
 * Output:
 *  - public/backgrounds/backyard-day-wide.webp
 *  - public/backgrounds/backyard-night-wide.webp
 *
 * Usage:
 *   node scripts/generate-wide-backyard.js
 *   node scripts/generate-wide-backyard.js --width 1920 --height 1080
 */

/* eslint-disable no-console */

const path = require('node:path');
const fs = require('node:fs');

const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const BG_DIR = path.join(ROOT, 'public', 'backgrounds');

function argValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generateWide({ inputName, outputName, width, height, position }) {
  const inputPath = path.join(BG_DIR, inputName);
  const outputPath = path.join(BG_DIR, outputName);

  if (!fs.existsSync(inputPath)) {
    console.warn(`[wide-backyard] Skip (missing): ${path.relative(ROOT, inputPath)}`);
    return { ok: false, skipped: true, outputPath };
  }

  // Cover-resize to a landscape canvas.
  // - Use "south" framing so we keep more ground (dog plays on the lawn).
  // - Use nearest kernel so pixel-art stays crisp.
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'cover',
      position,
      kernel: sharp.kernel.nearest,
    })
    // Slight pop without changing the art style.
    .modulate({ saturation: 1.03, brightness: 1.02 })
    .webp({ quality: 86 })
    .toFile(outputPath);

  console.log(`[wide-backyard] Wrote ${path.relative(ROOT, outputPath)}`);
  return { ok: true, skipped: false, outputPath };
}

async function main() {
  const width = argValue('--width', 1920);
  const height = argValue('--height', 1080);

  await ensureDir(BG_DIR);

  // Day: keep more ground.
  await generateWide({
    inputName: 'backyard-day.webp',
    outputName: 'backyard-day-wide.webp',
    width,
    height,
    position: 'south',
  });

  // Night: keep composition consistent.
  await generateWide({
    inputName: 'backyard-night.webp',
    outputName: 'backyard-night-wide.webp',
    width,
    height,
    position: 'south',
  });
}

main().catch((e) => {
  console.error('[wide-backyard] FAIL', e);
  process.exit(1);
});
