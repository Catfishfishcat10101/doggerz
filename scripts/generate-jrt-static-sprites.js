/** @format */

// scripts/generate-jrt-static-sprites.js
// Generates single-frame, realistic static sprites from the JRT animation strips.
// This fixes the "sprite sheet grid" fallback by ensuring fallbackSrc is a single dog.
//
// Output files:
//  - public/sprites/jack_russell_puppy.webp
//  - public/sprites/jack_russell_adult.webp
//  - public/sprites/jack_russell_senior.webp
//
// Usage:
//   node scripts/generate-jrt-static-sprites.js

const path = require('node:path');
const fs = require('node:fs/promises');

let sharp;
try {
  // eslint-disable-next-line global-require
  sharp = require('sharp');
} catch {
  console.error('[Doggerz] Missing dependency: sharp');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');

const STAGES = [
  {
    key: 'puppy',
    src: 'public/sprites/anim/jrt/puppy/idle.webp',
    out: 'public/sprites/jack_russell_puppy.webp',
  },
  {
    key: 'adult',
    src: 'public/sprites/anim/jrt/adult/idle.webp',
    out: 'public/sprites/jack_russell_adult.webp',
  },
  {
    key: 'senior',
    src: 'public/sprites/anim/jrt/senior/idle.webp',
    out: 'public/sprites/jack_russell_senior.webp',
  },
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('[Doggerz] Generating JRT static sprites from idle strips...');

  for (const s of STAGES) {
    const srcAbs = path.join(ROOT, s.src);
    const outAbs = path.join(ROOT, s.out);

    if (!(await exists(srcAbs))) {
      console.warn(`[Doggerz] Missing source strip: ${s.src} (skip)`);
      continue;
    }

    await fs.mkdir(path.dirname(outAbs), { recursive: true });

    const meta = await sharp(srcAbs).metadata();
    const frameSize = 1024;

    if (!meta.width || !meta.height) {
      console.warn(`[Doggerz] Could not read metadata for ${s.src} (skip)`);
      continue;
    }

    if (meta.height !== frameSize || meta.width < frameSize) {
      console.warn(
        `[Doggerz] Unexpected strip dimensions for ${s.src}: ${meta.width}x${meta.height} (expected height ${frameSize}). Continuing anyway...`
      );
    }

    // Crop the first frame (left-most 1024x1024).
    // This frame should be a clean, single-dog render.
    await sharp(srcAbs)
      .extract({
        left: 0,
        top: 0,
        width: Math.min(frameSize, meta.width),
        height: Math.min(frameSize, meta.height),
      })
      .resize(frameSize, frameSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 85, effort: 5 })
      .toFile(outAbs);

    console.log(`[Doggerz] Wrote ${s.out}`);
  }

  console.log('[Doggerz] Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
