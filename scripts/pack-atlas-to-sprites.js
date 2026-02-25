/* eslint-disable no-console */
// scripts/pack-atlas-to-sprites.js
// Convert a packed Pixi atlas into a uniform 128x128 grid spritesheet.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const ATLAS_DIR = path.join(ROOT, "public", "assets", "atlas");
const OUTPUT_DIR = path.join(ROOT, "public", "assets", "sprites", "jr");

const FRAME_SIZE = 128;
const COLUMNS = 8;

// Add your custom tricks to the end of the array
const ROWS = ["idle", "walk", "sleep", "bark", "scratch", "front_flip"];

// Add the frame count for your custom trick
const FRAMES_BY_ANIM = {
  idle: 6,
  walk: 8,
  sleep: 6,
  bark: 4,
  scratch: 6,
  front_flip: 16,
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listAtlasJsons() {
  if (!fs.existsSync(ATLAS_DIR)) return [];
  return fs
    .readdirSync(ATLAS_DIR)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .map((name) => path.join(ATLAS_DIR, name));
}

function normalizeFrames(atlas) {
  const out = [];

  if (Array.isArray(atlas?.frames)) {
    atlas.frames.forEach((entry) => {
      const name = entry?.filename || entry?.name || "";
      const frame = entry?.frame || entry;
      if (!name || !frame) return;
      out.push({
        name,
        frame: {
          x: Number(frame.x ?? frame.left ?? 0),
          y: Number(frame.y ?? frame.top ?? 0),
          w: Number(frame.w ?? frame.width ?? 0),
          h: Number(frame.h ?? frame.height ?? 0),
        },
        rotated: Boolean(entry?.rotated),
      });
    });
    return out;
  }

  if (atlas?.frames && typeof atlas.frames === "object") {
    Object.entries(atlas.frames).forEach(([name, entry]) => {
      const frame = entry?.frame || entry;
      if (!name || !frame) return;
      out.push({
        name,
        frame: {
          x: Number(frame.x ?? frame.left ?? 0),
          y: Number(frame.y ?? frame.top ?? 0),
          w: Number(frame.w ?? frame.width ?? 0),
          h: Number(frame.h ?? frame.height ?? 0),
        },
        rotated: Boolean(entry?.rotated),
      });
    });
    return out;
  }

  if (Array.isArray(atlas?.textures)) {
    atlas.textures.forEach((tex) => {
      if (!Array.isArray(tex?.frames)) return;
      tex.frames.forEach((entry) => {
        const name = entry?.filename || entry?.name || "";
        const frame = entry?.frame || entry;
        if (!name || !frame) return;
        out.push({
          name,
          frame: {
            x: Number(frame.x ?? frame.left ?? 0),
            y: Number(frame.y ?? frame.top ?? 0),
            w: Number(frame.w ?? frame.width ?? 0),
            h: Number(frame.h ?? frame.height ?? 0),
          },
          rotated: Boolean(entry?.rotated),
        });
      });
    });
  }

  return out;
}

function parseAnimAndIndex(name) {
  const clean = String(name || "").replace(/\\/g, "/");
  const parts = clean.split("/").filter(Boolean);
  const base = parts[parts.length - 1] || "";
  const baseNoExt = base.replace(/\.[^.]+$/, "");

  let anim = "";
  if (parts.length > 1) {
    anim = parts[0];
  }
  if (!anim) {
    if (baseNoExt.includes("_")) anim = baseNoExt.split("_")[0];
    else if (baseNoExt.includes("-")) anim = baseNoExt.split("-")[0];
    else anim = baseNoExt;
  }

  const match = baseNoExt.match(/(\d+)(?!.*\d)/);
  const index = match ? Number(match[1]) : 0;

  return { anim: String(anim).toLowerCase(), index };
}

function buildFrameMap(frames) {
  const map = {};
  frames.forEach((frame) => {
    const info = parseAnimAndIndex(frame.name);
    if (!info.anim) return;
    if (!map[info.anim]) map[info.anim] = {};
    map[info.anim][info.index] = frame;
  });
  return map;
}

function resolveAtlasImagePath(jsonPath, atlas) {
  const metaImage = atlas?.meta?.image || null;
  if (metaImage) {
    const candidate = path.isAbsolute(metaImage)
      ? metaImage
      : path.join(path.dirname(jsonPath), metaImage);
    if (fs.existsSync(candidate)) return candidate;
  }

  const base = path.basename(jsonPath, path.extname(jsonPath));
  const candidate = path.join(path.dirname(jsonPath), `${base}.png`);
  if (fs.existsSync(candidate)) return candidate;

  return null;
}

function resolveOutputName(jsonPath) {
  const base = path.basename(jsonPath, path.extname(jsonPath));
  let name = base.replace(/^jr[_-]/, "").replace(/^atlas[_-]/, "");

  const parts = name.split(/[_-]/).filter(Boolean);
  let stage = parts[0] || "pup";
  let condition = parts[1] || "clean";

  if (stage === "puppy") stage = "pup";
  if (!/^(pup|adult|senior)$/.test(stage)) stage = "pup";

  if (!/^(clean|dirty|fleas|mange)$/.test(condition)) condition = "clean";

  return `${stage}_${condition}.png`;
}

async function makeBlankTile() {
  return sharp({
    create: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
}

async function renderTile(atlasBuffer, frame, blankTile) {
  if (!frame) return blankTile;

  const rect = frame.frame || {};
  const width = Math.round(Number(rect.w ?? 0));
  const height = Math.round(Number(rect.h ?? 0));
  const left = Math.round(Number(rect.x ?? 0));
  const top = Math.round(Number(rect.y ?? 0));

  if (width <= 0 || height <= 0) return blankTile;

  let tile = sharp(atlasBuffer)
    .extract({ left, top, width, height })
    .ensureAlpha();

  if (frame.rotated) {
    // Most packers rotate frames 90 degrees clockwise; rotate back.
    tile = tile.rotate(-90);
  }

  let meta = await tile.metadata();

  if (meta.width > FRAME_SIZE || meta.height > FRAME_SIZE) {
    tile = tile.resize({
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      fit: "inside",
    });
    meta = await tile.metadata();
  }

  const padLeft = Math.max(0, Math.floor((FRAME_SIZE - meta.width) / 2));
  const padTop = Math.max(0, Math.floor((FRAME_SIZE - meta.height) / 2));

  const tileBuffer = await tile.png().toBuffer();

  return sharp({
    create: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: tileBuffer, left: padLeft, top: padTop }])
    .png()
    .toBuffer();
}

async function processAtlas(jsonPath) {
  const atlasRaw = fs.readFileSync(jsonPath, "utf8");
  const atlas = JSON.parse(atlasRaw);
  const frames = normalizeFrames(atlas);

  if (!frames.length) {
    console.warn(`No frames found in ${jsonPath}`);
    return;
  }

  const atlasImagePath = resolveAtlasImagePath(jsonPath, atlas);
  if (!atlasImagePath || !fs.existsSync(atlasImagePath)) {
    console.warn(`Missing atlas image for ${jsonPath}`);
    return;
  }

  const atlasBuffer = fs.readFileSync(atlasImagePath);
  const frameMap = buildFrameMap(frames);
  const blankTile = await makeBlankTile();

  let rowCursor = 0;
  const placements = [];

  ROWS.forEach((anim) => {
    const frameCount = Math.max(0, Number(FRAMES_BY_ANIM[anim] || 0));
    if (!frameCount) return;

    for (let i = 0; i < frameCount; i += 1) {
      const col = i % COLUMNS;
      const row = rowCursor + Math.floor(i / COLUMNS);
      const frame = frameMap[anim]?.[i] || null;
      placements.push({ anim, index: i, col, row, frame });
    }

    rowCursor += Math.max(1, Math.ceil(frameCount / COLUMNS));
  });

  const totalRows = Math.max(1, rowCursor);
  const outWidth = COLUMNS * FRAME_SIZE;
  const outHeight = totalRows * FRAME_SIZE;

  const composites = [];
  for (const placement of placements) {
    if (!placement.frame) {
      console.warn(
        `Missing frame: ${placement.anim} #${placement.index} in ${jsonPath}`
      );
    }

    const tile = await renderTile(atlasBuffer, placement.frame, blankTile);
    composites.push({
      input: tile,
      left: placement.col * FRAME_SIZE,
      top: placement.row * FRAME_SIZE,
    });
  }

  const outputName = resolveOutputName(jsonPath);
  const outputPath = path.join(OUTPUT_DIR, outputName);

  ensureDir(OUTPUT_DIR);

  await sharp({
    create: {
      width: outWidth,
      height: outHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outputPath);

  console.log(`Wrote ${outputPath}`);
}

async function main() {
  const jsons = listAtlasJsons();
  if (!jsons.length) {
    console.warn(`No atlas json files found in ${ATLAS_DIR}`);
    return;
  }

  for (const jsonPath of jsons) {
    // eslint-disable-next-line no-await-in-loop
    await processAtlas(jsonPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
