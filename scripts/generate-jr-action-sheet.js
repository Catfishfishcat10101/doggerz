#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const DEFAULT_MANIFEST = path.join(ROOT, "src/components/dog/jrManifest.json");
const DEFAULT_SOURCE = path.join(
  ROOT,
  "public/assets/sprites/jr/spritesheet.png"
);
const DEFAULT_OUT_DIR = path.join(ROOT, "public/assets/sprites/jr");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizeAction(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function normalizeStage(value) {
  const s = String(value || "pup")
    .trim()
    .toLowerCase();
  if (s.startsWith("adult")) return "adult";
  if (s.startsWith("sen")) return "senior";
  return "pup";
}

function parseArgs(argv) {
  const opts = {
    action: "idle_resting",
    stage: "pup",
    source: DEFAULT_SOURCE,
    manifestPath: DEFAULT_MANIFEST,
    outDir: DEFAULT_OUT_DIR,
    outPath: "",
    frames: null,
    columns: null,
    size: null,
    writeStatic: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--action") opts.action = argv[i + 1] || opts.action;
    if (arg === "--stage") opts.stage = argv[i + 1] || opts.stage;
    if (arg === "--source") opts.source = argv[i + 1] || opts.source;
    if (arg === "--manifest")
      opts.manifestPath = argv[i + 1] || opts.manifestPath;
    if (arg === "--out-dir") opts.outDir = argv[i + 1] || opts.outDir;
    if (arg === "--out") opts.outPath = argv[i + 1] || opts.outPath;
    if (arg === "--frames") opts.frames = Number(argv[i + 1]);
    if (arg === "--columns") opts.columns = Number(argv[i + 1]);
    if (arg === "--size") opts.size = Number(argv[i + 1]);
    if (arg === "--write-static") opts.writeStatic = true;
  }

  opts.action = normalizeAction(opts.action);
  opts.stage = normalizeStage(opts.stage);
  opts.source = path.resolve(ROOT, opts.source);
  opts.manifestPath = path.resolve(ROOT, opts.manifestPath);
  opts.outDir = path.resolve(ROOT, opts.outDir);
  opts.outPath = opts.outPath
    ? path.resolve(ROOT, opts.outPath)
    : path.join(opts.outDir, `${opts.stage}_${opts.action}.png`);

  return opts;
}

function readManifest(filePath) {
  if (!fs.existsSync(filePath)) fail(`Manifest not found: ${filePath}`);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    return json && typeof json === "object" ? json : {};
  } catch (error) {
    fail(`Failed reading manifest: ${error.message}`);
    return {};
  }
}

function resolveActionConfig(manifest, action) {
  const rows = Array.isArray(manifest?.rows) ? manifest.rows : [];
  const row = rows.find(
    (entry) =>
      normalizeAction(entry?.anim) === action ||
      normalizeAction(manifest?.aliases?.[action]) ===
        normalizeAction(entry?.anim)
  );

  const frameSize = Math.max(
    32,
    Number(manifest?.frame?.width || manifest?.frame?.height || 256)
  );

  return {
    frames: Math.max(1, Number(row?.frames || manifest?.columns || 8)),
    columns: Math.max(1, Number(row?.columns || manifest?.columns || 8)),
    size: frameSize,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createMotion(action, frameIndex, frameCount) {
  const t = frameCount <= 1 ? 0 : frameIndex / frameCount;
  const cycle = Math.PI * 2 * t;
  const isLeft = action.endsWith("_left");

  if (
    action === "walk" ||
    action === "walk_left" ||
    action === "walk_right" ||
    action === "turn_walk_left" ||
    action === "turn_walk_right"
  ) {
    return {
      dx: Math.sin(cycle) * 4,
      dy: Math.abs(Math.sin(cycle * 2)) * 6,
      rotateDeg: Math.sin(cycle) * 1.8,
      scaleX: 1,
      scaleY: 1 + Math.sin(cycle * 2) * 0.01,
      brightness: 1,
      flipX: isLeft,
    };
  }

  if (action === "idle_resting") {
    const blinkWindow =
      frameIndex === 4 || frameIndex === 5 || frameIndex === 10;
    return {
      dx: Math.sin(cycle * 2) * 2,
      dy: Math.sin(cycle) * 4,
      rotateDeg: Math.sin(cycle * 1.25) * 1.2,
      scaleX: 1 + Math.sin(cycle) * 0.01,
      scaleY: 1 + Math.sin(cycle + Math.PI / 2) * 0.018,
      brightness: blinkWindow ? 0.97 : 1,
      flipX: false,
    };
  }

  if (action === "idle") {
    const blinkWindow =
      frameIndex === 6 || frameIndex === 7 || frameIndex === 14;
    return {
      dx: Math.sin(cycle * 2) * 2,
      dy: Math.sin(cycle) * 3,
      rotateDeg: Math.sin(cycle * 1.5) * 1,
      scaleX: 1 + Math.sin(cycle) * 0.008,
      scaleY: 1 + Math.sin(cycle + Math.PI / 2) * 0.015,
      brightness: blinkWindow ? 0.97 : 1,
      flipX: false,
    };
  }

  return {
    dx: Math.sin(cycle * 2) * 3,
    dy: Math.sin(cycle) * 3,
    rotateDeg: Math.sin(cycle * 1.5) * 1.5,
    scaleX: 1,
    scaleY: 1,
    brightness: 1,
    flipX: isLeft,
  };
}

async function renderFrame(baseBuffer, frameSize, motion) {
  const baseMeta = await sharp(baseBuffer).metadata();
  const nextWidth = clamp(
    Math.round(baseMeta.width * motion.scaleX),
    Math.round(frameSize * 0.45),
    Math.round(frameSize * 0.92)
  );
  const nextHeight = clamp(
    Math.round(baseMeta.height * motion.scaleY),
    Math.round(frameSize * 0.45),
    Math.round(frameSize * 0.92)
  );

  let transformPipeline = sharp(baseBuffer).resize(nextWidth, nextHeight, {
    fit: "inside",
  });
  if (motion.flipX) transformPipeline = transformPipeline.flop();

  const transformed = await transformPipeline
    .rotate(motion.rotateDeg, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .modulate({ brightness: motion.brightness })
    .png()
    .toBuffer();

  const transformedMeta = await sharp(transformed).metadata();
  const left = clamp(
    Math.round((frameSize - transformedMeta.width) / 2 + motion.dx),
    0,
    Math.max(0, frameSize - transformedMeta.width)
  );
  const top = clamp(
    Math.round((frameSize - transformedMeta.height) / 2 + motion.dy),
    0,
    Math.max(0, frameSize - transformedMeta.height)
  );

  return sharp({
    create: {
      width: frameSize,
      height: frameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: transformed, left, top }])
    .png()
    .toBuffer();
}

async function buildSheet({
  sourcePath,
  outPath,
  action,
  frames,
  columns,
  frameSize,
  writeStatic,
  stage,
}) {
  if (!fs.existsSync(sourcePath)) fail(`Source image not found: ${sourcePath}`);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const baseTarget = Math.round(frameSize * 0.82);
  const baseBuffer = await sharp(sourcePath)
    .resize(baseTarget, baseTarget, { fit: "inside" })
    .png()
    .toBuffer();

  const frameBuffers = [];
  for (let i = 0; i < frames; i += 1) {
    const motion = createMotion(action, i, frames);
    // Build each frame independently so motion can be tuned per action key.
    const frame = await renderFrame(baseBuffer, frameSize, motion);
    frameBuffers.push(frame);
  }

  const rows = Math.ceil(frames / columns);
  const composites = frameBuffers.map((input, index) => ({
    input,
    left: (index % columns) * frameSize,
    top: Math.floor(index / columns) * frameSize,
  }));

  await sharp({
    create: {
      width: columns * frameSize,
      height: rows * frameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outPath);

  if (writeStatic && frameBuffers[0]) {
    const staticPath = path.join(path.dirname(outPath), `${stage}_clean.png`);
    await fs.promises.writeFile(staticPath, frameBuffers[0]);
    console.log(`Wrote static fallback: ${path.relative(ROOT, staticPath)}`);
  }

  console.log(
    `Wrote ${path.relative(ROOT, outPath)} (${frames} frames, ${columns} columns, ${frameSize}px)`
  );
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifest = readManifest(opts.manifestPath);
  const defaults = resolveActionConfig(manifest, opts.action);

  const frames = Number.isFinite(opts.frames)
    ? Math.max(1, opts.frames)
    : defaults.frames;
  const columns = Number.isFinite(opts.columns)
    ? Math.max(1, opts.columns)
    : defaults.columns;
  const frameSize = Number.isFinite(opts.size)
    ? Math.max(32, opts.size)
    : defaults.size;

  await buildSheet({
    sourcePath: opts.source,
    outPath: opts.outPath,
    action: opts.action,
    frames,
    columns,
    frameSize,
    writeStatic: opts.writeStatic,
    stage: opts.stage,
  });
}

main().catch((error) => {
  fail(error?.stack || error?.message || String(error));
});
