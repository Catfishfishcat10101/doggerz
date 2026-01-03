// scripts/sprites/batch-resize.mjs
// Batch convert Krita-exported frames into runtime-ready WebP frames + meta.json.
//
// INPUT (raw exports; NOT deployed):
//   art/exports/jrt/<stage>/<action>/frame_0001.png ...
//
// OUTPUT (runtime assets; deployed):
//   public/sprites/jrt/<stage>/<action>/frame_0001.webp + meta.json

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();

const DEFAULTS = {
  inRoot: "art/exports/jrt",
  outRoot: "public/sprites/jrt",
  size: 256,        // target square frame
  fps: 12,          // default; can override per-action later
  quality: 85,      // webp quality (0-100). Increase if needed.
};

function isImageFile(name) {
  const lower = name.toLowerCase();
  return (
    lower.endsWith(".png") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg")
  );
}

function naturalFrameSort(a, b) {
  // Sort by number in frame_0001
  const getNum = (s) => {
    const m = s.match(/(\d+)(?=\.[a-z]+$)/i);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  };
  return getNum(a) - getNum(b);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => e.name);
}

async function writeMeta(outDir, meta) {
  const p = path.join(outDir, "meta.json");
  await fs.writeFile(p, JSON.stringify(meta, null, 2), "utf8");
}

async function convertAction({ stage, action, inDir, outDir, size, fps, quality }) {
  const allFiles = (await listFiles(inDir))
    .filter(isImageFile)
    .sort(naturalFrameSort);

  if (allFiles.length === 0) {
    console.log(`[skip] ${stage}/${action} (no frames found)`);
    return;
  }

  await ensureDir(outDir);

  // Convert frames
  for (let i = 0; i < allFiles.length; i++) {
    const srcName = allFiles[i];
    const srcPath = path.join(inDir, srcName);

    const frameNum = String(i + 1).padStart(4, "0");
    const outName = `frame_${frameNum}.webp`;
    const outPath = path.join(outDir, outName);

    // Resize to exact size, preserve transparency
    // "contain" keeps the whole dog without cropping; adds transparent padding as needed.
    await sharp(srcPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality, effort: 6 })
      .toFile(outPath);

    if ((i + 1) % 25 === 0 || i === allFiles.length - 1) {
      console.log(`[ok] ${stage}/${action}: ${i + 1}/${allFiles.length}`);
    }
  }

  const meta = {
    version: 1,
    kind: "frames",
    format: "webp",
    stage,
    action,
    frameSize: size,
    fps,
    frames: allFiles.length,
    filePattern: "frame_{0001..####}.webp",
    generatedAt: new Date().toISOString(),
  };

  await writeMeta(outDir, meta);
  console.log(`[meta] wrote ${stage}/${action}/meta.json`);
}

async function main() {
  // CLI usage:
  // node scripts/sprites/batch-resize.mjs
  // node scripts/sprites/batch-resize.mjs --size=256 --fps=12 --quality=85
  const args = process.argv.slice(2);
  const argMap = Object.fromEntries(
    args
      .filter((a) => a.startsWith("--") && a.includes("="))
      .map((a) => a.slice(2).split("="))
  );

  const inRoot = path.join(ROOT, DEFAULTS.inRoot);
  const outRoot = path.join(ROOT, DEFAULTS.outRoot);

  const size = Number(argMap.size ?? DEFAULTS.size);
  const fps = Number(argMap.fps ?? DEFAULTS.fps);
  const quality = Number(argMap.quality ?? DEFAULTS.quality);

  console.log(`IN : ${inRoot}`);
  console.log(`OUT: ${outRoot}`);
  console.log(`size=${size} fps=${fps} quality=${quality}`);

  // stages like puppy/adult/senior
  const stages = await listDirs(inRoot);
  if (stages.length === 0) {
    console.error(`No stages found in ${inRoot}`);
    process.exit(1);
  }

  for (const stage of stages) {
    const stageIn = path.join(inRoot, stage);
    const actions = await listDirs(stageIn);

    for (const action of actions) {
      const actionIn = path.join(stageIn, action);
      const actionOut = path.join(outRoot, stage, action);
      await convertAction({ stage, action, inDir: actionIn, outDir: actionOut, size, fps, quality });
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
