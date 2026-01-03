/**
 * eslint-disable no-console
 *
 * @format
 */

// scripts/generate-jrt-sprite-pack.js
// Generates simple sprite-strip "packs" from the existing realistic Jack Russell images.
// IMPORTANT: These are NOT true frame-drawn animations; they are procedurally transformed
// variants of a single source image (good as a placeholder until you have real frames).
//
// Output:
//   public/sprites/anim/jrt/{puppy|adult|senior}/{idle|walk|sit|lay|eat|bark}.webp
//
// Usage:
//   node scripts/generate-jrt-sprite-pack.js

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function round(n) {
  return Math.round(Number(n) || 0);
}

async function renderFrame({ srcPath, size, rotateDeg, dx, dy, scale }) {
  const W = size;
  const H = size;

  // Strategy: render to a larger transparent canvas (resize+contain) then crop back
  // to WxH with a shifted crop window (dx/dy) for motion.
  const s = clamp(scale ?? 1, 0.9, 1.1);
  const renderW = round(W * 1.35 * s);
  const renderH = round(H * 1.35 * s);

  const cropLeft = clamp(round((renderW - W) / 2 - (dx || 0)), 0, renderW - W);
  const cropTop = clamp(round((renderH - H) / 2 - (dy || 0)), 0, renderH - H);

  return sharp(srcPath)
    .rotate(rotateDeg || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(renderW, renderH, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extract({ left: cropLeft, top: cropTop, width: W, height: H })
    .webp({ quality: 88 })
    .toBuffer();
}

async function buildStrip({ srcPath, outPath, frames, size, frameFn }) {
  const W = size;
  const H = size;

  const out = sharp({
    create: {
      width: W * frames,
      height: H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites = [];
  for (let i = 0; i < frames; i += 1) {
    const spec = frameFn(i, frames);
    const frame = await renderFrame({ srcPath, size, ...spec });
    composites.push({ input: frame, left: i * W, top: 0 });
  }

  ensureDir(path.dirname(outPath));

  await out.composite(composites).webp({ quality: 86 }).toFile(outPath);
}

function makeFrameFns() {
  return {
    idle(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t) * 0.6,
        dy: Math.sin(t) * -2.2,
        dx: Math.sin(t * 0.5) * 0.8,
        scale: 1 + Math.sin(t) * 0.006,
      };
    },
    walk(i, n) {
      const t = (i / n) * Math.PI * 2;
      // snappier bob + slight tilt; meant to read like a walk-cycle from a distance
      return {
        rotateDeg: Math.sin(t) * 1.0,
        dy: Math.sin(t * 2) * -3.2,
        dx: Math.sin(t) * 2.0,
        scale: 1 + Math.sin(t * 2) * 0.008,
      };
    },
    sit(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t) * 0.35,
        dy: Math.sin(t) * -1.6 + 1.6,
        dx: Math.sin(t * 0.5) * 0.6,
        scale: 0.985 + Math.sin(t) * 0.004,
      };
    },
    lay(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t) * 0.2,
        dy: Math.sin(t) * -1.0 + 2.2,
        dx: Math.sin(t * 0.4) * 0.5,
        scale: 0.98 + Math.sin(t) * 0.003,
      };
    },
    eat(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t) * 0.5,
        dy: Math.sin(t) * -2.8 + 1.0,
        dx: Math.sin(t) * 0.8,
        scale: 1 + Math.sin(t) * 0.005,
      };
    },
    bark(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t * 2) * 0.9,
        dy: Math.sin(t * 2) * -2.2,
        dx: Math.sin(t) * 0.8,
        scale: 1 + Math.sin(t * 2) * 0.01,
      };
    },
  };
}

async function main() {
  const packs = [
    { stage: 'puppy', src: 'public/sprites/jack_russell_puppy.webp' },
    { stage: 'adult', src: 'public/sprites/jack_russell_adult.webp' },
    { stage: 'senior', src: 'public/sprites/jack_russell_senior.webp' },
  ];

  const animations = [
    { name: 'idle', frames: 12, size: 1024 },
    { name: 'walk', frames: 12, size: 1024 },
    { name: 'sit', frames: 8, size: 1024 },
    { name: 'lay', frames: 8, size: 1024 },
    { name: 'eat', frames: 8, size: 1024 },
    { name: 'bark', frames: 6, size: 1024 },
  ];

  const fns = makeFrameFns();

  console.log('[sprites] Generating JRT sprite strips...');

  for (const pack of packs) {
    const srcPath = path.join(ROOT, pack.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[sprites] Missing source: ${pack.src} (skipping)`);
      continue;
    }

    for (const anim of animations) {
      const outPath = path.join(
        ROOT,
        `public/sprites/anim/jrt/${pack.stage}/${anim.name}.webp`
      );

      const frameFn = fns[anim.name];
      if (!frameFn) continue;

      console.log(
        `[sprites] ${pack.stage}/${anim.name} (${
          anim.frames
        } frames) -> ${path.relative(ROOT, outPath)}`
      );

      await buildStrip({
        srcPath,
        outPath,
        frames: anim.frames,
        size: anim.size,
        frameFn,
      });
    }
  }

  console.log('[sprites] Done.');
}

main().catch((err) => {
  console.error('[sprites] Failed:', err);
  process.exitCode = 1;
});
