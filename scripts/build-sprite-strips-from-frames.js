/**
 * eslint-disable no-console
 * @format
 */

// scripts/build-sprite-strips-from-frames.js
// Build sprite strips + a manifest from REAL per-frame images.
//
// Input (you provide REAL animation frames):
//   art/frames/jrt/<stage>/<anim>/frame_0001.webp (or .png)
//   (override with SPRITES_FRAMES_ROOT)
//
// Output:
//   public/sprites/anim/jrt/<stage>/<anim>.webp   (horizontal strip)
//   public/sprites/anim/jrt/manifest.json         (frames/fps metadata)
//
// Usage:
//   node scripts/build-sprite-strips-from-frames.js

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

const DEFAULT_FRAMES_ROOT = path.join(ROOT, 'art', 'frames', 'jrt');
const LEGACY_FRAMES_ROOT = path.join(
  ROOT,
  'public',
  'sprites',
  'frames',
  'jrt'
);
const FRAMES_ROOT = process.env.SPRITES_FRAMES_ROOT
  ? path.resolve(ROOT, process.env.SPRITES_FRAMES_ROOT)
  : DEFAULT_FRAMES_ROOT;
const OUT_ROOT = path.join(ROOT, 'public', 'sprites', 'anim', 'jrt');

const DEFAULT_FRAME_SIZE = 1024;

// A sensible starter set. Add new animations just by adding folders with frames.
// FPS can be overridden in a per-anim _meta.json placed inside the anim folder.
const DEFAULT_FPS = {
  idle: 6,
  walk: 12,
  run: 16,
  sit: 6,
  lay: 5,
  sleep: 4,
  eat: 10,
  drink: 8,
  bark: 12,
  howl: 10,
  pant: 8,
  wag: 10,
  jump: 12,
  roll: 10,
  shake: 12,
  scratch: 10,
  sniff: 10,
  dig: 12,
  pee: 8,
  poop: 8,
  bow: 10,
  fetch: 12,
  paw: 10,
  spin: 12,
  stand: 8,
  stretch: 8,
  yawn: 6,
  lick: 10,
  play_dead: 8,
  beg: 10,
  sit_pretty: 10,
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isImageFile(name) {
  const ext = path.extname(name).toLowerCase();
  return ext === '.png' || ext === '.webp';
}

function readJsonIfExists(p) {
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function listDirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function listFrameFiles(animDirAbs) {
  if (!fs.existsSync(animDirAbs)) return [];
  return fs
    .readdirSync(animDirAbs)
    .filter((n) => isImageFile(n))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    )
    .map((n) => path.join(animDirAbs, n));
}

function safeStat(p) {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

function maxMtimeMs(paths) {
  let max = 0;
  for (const p of paths) {
    const st = safeStat(p);
    if (!st) continue;
    const ms = st.mtimeMs || 0;
    if (ms > max) max = ms;
  }
  return max;
}

async function normalizeFrameBuffer(framePath, frameSize) {
  // Normalize arbitrary input frames to a consistent WxH on transparent background.
  return sharp(framePath)
    .resize(frameSize, frameSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .toFormat('webp', { quality: 92 })
    .toBuffer();
}

async function shouldUseDirectComposite({ framePaths, frameSize }) {
  // Fast path: if frames are already WxH and have alpha, composite directly from files.
  // This avoids re-encoding every frame, which can be slow for large projects.
  try {
    if (!framePaths || framePaths.length === 0) return false;
    const meta = await sharp(framePaths[0]).metadata();
    if (meta.width !== frameSize || meta.height !== frameSize) return false;
    // Some formats may not report hasAlpha; if channels===4 we assume alpha.
    if (meta.hasAlpha === false && meta.channels !== 4) return false;
    return true;
  } catch {
    return false;
  }
}

async function buildStripFromFrames({
  framePaths,
  outPath,
  frameSize,
  normalizeMode = 'auto',
}) {
  const frames = framePaths.length;
  const W = frameSize;
  const H = frameSize;

  const out = sharp({
    create: {
      width: W * frames,
      height: H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites = [];

  const directOk =
    normalizeMode === 'never'
      ? true
      : normalizeMode === 'always'
      ? false
      : await shouldUseDirectComposite({ framePaths, frameSize });

  if (directOk) {
    for (let i = 0; i < frames; i += 1) {
      composites.push({ input: framePaths[i], left: i * W, top: 0 });
    }
  } else {
    for (let i = 0; i < frames; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const buf = await normalizeFrameBuffer(framePaths[i], frameSize);
      composites.push({ input: buf, left: i * W, top: 0 });
    }
  }

  ensureDir(path.dirname(outPath));
  const tmpPath = `${outPath}.tmp`;
  await out.composite(composites).webp({ quality: 90 }).toFile(tmpPath);
  try {
    fs.rmSync(outPath, { force: true });
  } catch {
    // ignore
  }
  fs.renameSync(tmpPath, outPath);
}

async function main() {
  console.log('[sprites] Building REAL sprite strips from per-frame images...');

  // By default we do an incremental build: if an output strip exists and is newer than
  // its input frames, we skip rebuilding it (but still include it in the manifest).
  // Use SPRITES_BUILD_FORCE=1 to rebuild everything.
  const FORCE_REBUILD =
    process.env.SPRITES_BUILD_FORCE === '1' ||
    process.env.SPRITES_BUILD_FORCE === 'true';
  const NORMALIZE_MODE = (
    process.env.SPRITES_BUILD_NORMALIZE || 'auto'
  ).toLowerCase();

  const framesRoot = fs.existsSync(FRAMES_ROOT)
    ? FRAMES_ROOT
    : fs.existsSync(LEGACY_FRAMES_ROOT)
    ? LEGACY_FRAMES_ROOT
    : null;

  if (!framesRoot) {
    console.warn(
      '[sprites] Missing frames folder. Looked for:\n' +
        `- ${path.relative(ROOT, FRAMES_ROOT)}\n` +
        `- ${path.relative(ROOT, LEGACY_FRAMES_ROOT)}\n` +
        'Create: art/frames/jrt/<stage>/<anim>/frame_0001.webp (or set SPRITES_FRAMES_ROOT)'
    );
    process.exitCode = 1;
    return;
  }

  const stages = listDirs(framesRoot);
  if (stages.length === 0) {
    console.warn(
      `[sprites] No stages found in: ${path.relative(ROOT, framesRoot)}\n` +
        'Expected: puppy/, adult/, senior/ (or any stage name you use in-game).'
    );
    process.exitCode = 1;
    return;
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    frameSize: DEFAULT_FRAME_SIZE,
    stages: {},
  };

  let builtAnims = 0;
  let skippedAnims = 0;

  for (const stage of stages) {
    const stageDir = path.join(framesRoot, stage);
    const anims = listDirs(stageDir);

    if (anims.length === 0) {
      console.warn(`[sprites] ${stage}: no animation folders found (skipping)`);
      continue;
    }

    const stageKey = stage.toUpperCase();
    manifest.stages[stageKey] = {
      base: `/sprites/anim/jrt/${stage}`,
      frameSize: DEFAULT_FRAME_SIZE,
      anims: {},
    };

    for (const anim of anims) {
      const animDir = path.join(stageDir, anim);
      const metaPath = path.join(animDir, '_meta.json');
      const folderMeta = readJsonIfExists(metaPath) || {};

      const frameSize = Number(folderMeta.frameSize) || DEFAULT_FRAME_SIZE;
      const fps = Number(folderMeta.fps) || DEFAULT_FPS[anim] || 10;

      const framePaths = listFrameFiles(animDir);
      if (framePaths.length === 0) {
        console.warn(
          `[sprites] ${stage}/${anim}: no frame files found (skipping)`
        );
        continue;
      }

      const outPath = path.join(OUT_ROOT, stage, `${anim}.webp`);

      const newestInputMs = maxMtimeMs([metaPath, ...framePaths]);
      const outStat = safeStat(outPath);
      const outOk = outStat && outStat.size > 0;
      const upToDate = outOk && outStat.mtimeMs >= newestInputMs;

      if (!FORCE_REBUILD && upToDate) {
        manifest.stages[stageKey].anims[anim] = {
          file: `${anim}.webp`,
          frames: framePaths.length,
          fps,
        };
        skippedAnims += 1;
        continue;
      }

      console.log(
        `[sprites] ${stage}/${anim} (${
          framePaths.length
        } frames @ ${fps}fps) -> ${path.relative(ROOT, outPath)}`
      );

      // eslint-disable-next-line no-await-in-loop
      await buildStripFromFrames({
        framePaths,
        outPath,
        frameSize,
        normalizeMode: NORMALIZE_MODE,
      });

      manifest.stages[stageKey].anims[anim] = {
        file: `${anim}.webp`,
        frames: framePaths.length,
        fps,
      };

      builtAnims += 1;
    }
  }

  const totalAnims = builtAnims + skippedAnims;
  if (totalAnims === 0) {
    console.warn(
      '[sprites] No animations were built (no frame images found).\n' +
        'Add frames under art/frames/jrt/<stage>/<anim>/frame_0001.webp then re-run.'
    );
    console.warn(
      '[sprites] Not writing manifest.json (keeps app on fallback sprites).'
    );
    return;
  }

  ensureDir(OUT_ROOT);
  const manifestPath = path.join(OUT_ROOT, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(
    `[sprites] Wrote manifest -> ${path.relative(ROOT, manifestPath)}`
  );
  console.log(
    `[sprites] Built ${builtAnims} animation(s). Skipped ${skippedAnims} up-to-date animation(s).`
  );
  console.log('[sprites] Done.');
}

main().catch((err) => {
  console.error('[sprites] Failed:', err);
  process.exitCode = 1;
});
