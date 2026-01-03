/**
 * eslint-disable no-console
 *
 * @format
 */

// scripts/generate-jrt-sprite-pack.js
// Generates sprite-strip packs for Doggerz from your existing *realistic* Jack Russell images,
// by procedurally transforming the source render into multiple frames per animation.
//
// Output (required by sprites:check):
//   public/sprites/jrt_{puppy|adult|senior}.webp
//   public/sprites/anim/jrt/manifest.json
//   public/sprites/anim/jrt/{puppy|adult|senior}/{idle|walk|run|sleep}.webp
//
// Optional extras (also generated if configured below):
//   sit, lay, eat, bark
//
// Usage:
//   node scripts/generate-jrt-sprite-pack.js
//   node scripts/generate-jrt-sprite-pack.js --size 1024 --quality 90
//
// Notes:
// - This is not hand-drawn frame animation; it’s a deterministic “fake cycle” from a single
//   base render per stage. It still produces shippable, consistent strips if you own the sources.

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

const MANIFEST_PATH = path.join(
  ROOT,
  'public',
  'sprites',
  'anim',
  'jrt',
  'manifest.json'
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function round(n) {
  return Math.round(Number(n) || 0);
}

function getArg(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v ?? fallback;
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function pickSourceForStage(stage) {
  // Prefer "artist base" renders first (regenerate these anytime).
  const base = path.join(ROOT, `public/sprites/jack_russell_${stage}.webp`);
  if (exists(base)) return base;

  // Fall back to canonical filenames (runtime fallbacks) if the base doesn't exist.
  const preferred = path.join(ROOT, `public/sprites/jrt_${stage}.webp`);
  if (exists(preferred)) return preferred;

  return null;
}

async function ensureFallbackSquare({ stage, srcPath, size, quality }) {
  // Ensure the canonical fallback exists at public/sprites/jrt_{stage}.webp
  const outPath = path.join(ROOT, `public/sprites/jrt_${stage}.webp`);
  ensureDir(path.dirname(outPath));

  // If the source is already the canonical file, still normalize to square size/quality.
  await sharp(srcPath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality })
    .toFile(outPath);

  return outPath;
}

async function renderFrame({ srcPath, size, rotateDeg, dx, dy, scale }) {
  const W = size;
  const H = size;

  // Strategy:
  // 1) Rotate (transparent bg)
  // 2) Resize to a larger transparent canvas (contain)
  // 3) Extract a WxH crop window shifted by dx/dy to create “motion”
  const s = clamp(scale ?? 1, 0.88, 1.14);
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

async function buildStrip({
  srcPath,
  outPath,
  frames,
  size,
  frameFn,
  outQuality,
}) {
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
  await out.composite(composites).webp({ quality: outQuality }).toFile(outPath);
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
      return {
        rotateDeg: Math.sin(t) * 1.0,
        dy: Math.sin(t * 2) * -3.2,
        dx: Math.sin(t) * 2.0,
        scale: 1 + Math.sin(t * 2) * 0.008,
      };
    },
    run(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t) * 1.6,
        dy: Math.sin(t * 2) * -4.2,
        dx: Math.sin(t) * 3.0,
        scale: 1 + Math.sin(t * 2) * 0.012,
      };
    },
    sleep(i, n) {
      const t = (i / n) * Math.PI * 2;
      return {
        rotateDeg: Math.sin(t) * 0.25,
        dy: Math.sin(t) * -1.0 + 2.4,
        dx: Math.sin(t * 0.4) * 0.4,
        scale: 0.985 + Math.sin(t) * 0.003,
      };
    },

    // Optional extras (not required by sprites:check)
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

function writeManifest({ size, anims }) {
  const manifest = {
    version: 1,
    breed: 'jrt',
    frameSize: size,
    defaultFps: 10,
    stages: ['puppy', 'adult', 'senior'],
    anims,
  };

  ensureDir(path.dirname(MANIFEST_PATH));
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  );
}

async function main() {
  const size = clamp(Number(getArg('--size', '1024')), 128, 2048);
  const outQuality = clamp(Number(getArg('--quality', '90')), 50, 100);

  const packs = [{ stage: 'puppy' }, { stage: 'adult' }, { stage: 'senior' }];

  // Required by sprites:check (idle/walk/run/sleep)
  // Extras are fine, but your validator currently only requires the 4 below.
  const animations = [
    { name: 'idle', frames: 12, fps: 10 },
    { name: 'walk', frames: 12, fps: 12 },
    { name: 'run', frames: 12, fps: 14 },
    { name: 'sleep', frames: 12, fps: 6 },

    // Optional extras (uncomment if you want them generated too)
    // { name: 'sit', frames: 8, fps: 8 },
    // { name: 'lay', frames: 8, fps: 6 },
    // { name: 'eat', frames: 8, fps: 8 },
    // { name: 'bark', frames: 6, fps: 12 },
  ];

  const animsForManifest = {};
  for (const a of animations) {
    animsForManifest[a.name] = {
      frames: a.frames,
      fps: a.fps,
      file: `{stage}/${a.name}.webp`,
    };
  }

  const fns = makeFrameFns();

  console.log('[sprites] Generating JRT fallbacks + sprite strips...');
  writeManifest({ size, anims: animsForManifest });

  for (const pack of packs) {
    const srcPath = pickSourceForStage(pack.stage);
    if (!srcPath) {
      console.warn(
        `[sprites] Missing source for stage "${pack.stage}". Expected either:\n` +
          `  public/sprites/jrt_${pack.stage}.webp\n` +
          `  public/sprites/jack_russell_${pack.stage}.webp\n` +
          `Skipping stage.`
      );
      continue;
    }

    // Ensure canonical fallback exists (and normalized to square size)
    const fallbackPath = await ensureFallbackSquare({
      stage: pack.stage,
      srcPath,
      size,
      quality: outQuality,
    });

    console.log(
      `[sprites] fallback -> ${path.relative(
        ROOT,
        fallbackPath
      )} (size ${size})`
    );

    for (const anim of animations) {
      const frameFn = fns[anim.name];
      if (!frameFn) continue;

      const outPath = path.join(
        ROOT,
        `public/sprites/anim/jrt/${pack.stage}/${anim.name}.webp`
      );

      console.log(
        `[sprites] ${pack.stage}/${anim.name} (${
          anim.frames
        } frames) -> ${path.relative(ROOT, outPath)}`
      );

      await buildStrip({
        srcPath: fallbackPath, // use normalized fallback for consistent framing
        outPath,
        frames: anim.frames,
        size,
        frameFn,
        outQuality,
      });
    }
  }

  console.log('[sprites] Done.');
  console.log('[sprites] Next: npm run sprites:check');
}

main().catch((err) => {
  console.error('[sprites] Failed:', err);
  process.exitCode = 1;
});
