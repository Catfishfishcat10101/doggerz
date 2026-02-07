/**
 * Pack JR custom animation frames into a single atlas.
 *
 * Input (defaults):
 *   public/assets/imports/jr/<anim>/frame_###.png
 *
 * Output:
 *   public/assets/sprites/jr_custom.png
 *   public/assets/sprites/jr_custom.json
 */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT, "public", "assets", "imports", "jr");
const DEFAULT_OUT_DIR = path.join(ROOT, "public", "assets", "sprites");

const TILE_W = 128;
const TILE_H = 128;
const COLS = 16;

const ANIM_DIRS = [
  { name: "idle", dir: "idle" },
  { name: "wag", dir: "wag" },
  { name: "sleep", dir: "sleep" },
  { name: "walk_left", dir: "walk_left" },
  { name: "walk_right", dir: "walk_right" },
  { name: "turn_walk_right", dir: "turn_walk_right" },
  { name: "front_flip", dir: "front_flip" },
  { name: "jump", dir: "jump" },
  // Use the 128x128 walk frames as the canonical "walk" animation
  { name: "walk", dir: "walk_128" },
];

function pad(n) {
  return String(n).padStart(3, "0");
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function listFrames(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("frame_") && f.endsWith(".png"))
    .sort();
}

async function main() {
  const inputBase = DEFAULT_INPUT;
  const outDir = DEFAULT_OUT_DIR;
  const outPng = path.join(outDir, "jr_custom.png");
  const outJson = path.join(outDir, "jr_custom.json");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const animations = {};
  const frames = {};
  const composites = [];

  let idx = 0;

  for (const anim of ANIM_DIRS) {
    const dirPath = path.join(inputBase, anim.dir);
    const files = listFrames(dirPath);
    if (!files.length) {
      console.warn(`[atlas] Skipping ${anim.name}: no frames in ${dirPath}`);
      continue;
    }

    animations[anim.name] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const key = `${anim.name}/frame_${pad(i)}.png`;
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = col * TILE_W;
      const y = row * TILE_H;

      const srcPath = path.join(dirPath, file);
      const input = await sharp(srcPath)
        .resize(TILE_W, TILE_H, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

      composites.push({ input, left: x, top: y });

      frames[key] = {
        frame: { x, y, w: TILE_W, h: TILE_H },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: TILE_W, h: TILE_H },
        sourceSize: { w: TILE_W, h: TILE_H },
      };

      animations[anim.name].push(key);
      idx += 1;
    }
  }

  if (!composites.length) {
    console.error("[atlas] No frames found. Aborting.");
    process.exit(1);
  }

  const rows = Math.ceil(idx / COLS);
  const sheetW = COLS * TILE_W;
  const sheetH = rows * TILE_H;
  const outW = nextPow2(sheetW);
  const outH = nextPow2(sheetH);

  await sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPng);

  const json = {
    frames,
    animations,
    meta: {
      app: "doggerz-atlas-pack",
      version: "1.0",
      image: path.basename(outPng),
      format: "RGBA8888",
      size: { w: outW, h: outH },
      scale: "1",
    },
  };

  fs.writeFileSync(outJson, JSON.stringify(json, null, 2));
  console.log("[atlas] Wrote", outPng, outJson);
}

main().catch((err) => {
  console.error("[atlas] Failed:", err);
  process.exit(1);
});
