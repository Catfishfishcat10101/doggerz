// scripts/pack-atlas-to-sprites.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");

// default locations (can be overridden via CLI)
let ATLAS_DIR = path.join(ROOT, "public", "assets", "atlas");
// App loads sheets from /assets/sprites/jr/<stage>_<condition>.png
let OUT_DIR = path.join(ROOT, "public", "assets", "sprites", "jr");

const STAGES = ["pup", "adult", "senior"];
const ROWS = ["idle", "walk", "sleep", "bark", "scratch"];
const FRAMES_BY_ANIM = { idle: 6, walk: 8, sleep: 6, bark: 4, scratch: 6 };
let FRAME_W = 128;
let FRAME_H = 128;
let COLS = 8; // target columns

// Simple CLI parsing: node script [--atlas dir] [--out dir] [--w N] [--h N] [--cols N] [stage1,stage2]
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--atlas" && argv[i + 1]) ATLAS_DIR = path.resolve(argv[++i]);
  else if (a === "--out" && argv[i + 1]) OUT_DIR = path.resolve(argv[++i]);
  else if (a === "--w" && argv[i + 1]) FRAME_W = parseInt(argv[++i], 10);
  else if (a === "--h" && argv[i + 1]) FRAME_H = parseInt(argv[++i], 10);
  else if (a === "--cols" && argv[i + 1]) COLS = parseInt(argv[++i], 10);
  else if (!a.startsWith("--")) {
    // allow passing a comma separated list of stages
    const parts = a.split(",");
    if (parts.length) {
      // override STAGES in place
      STAGES.length = 0;
      for (const p of parts) if (p) STAGES.push(p);
    }
  }
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Get frame entry from atlas. Support both object keyed by filename and array style.
 */
function getFrameEntry(atlas, key) {
  if (!atlas || !atlas.frames) return null;
  if (Array.isArray(atlas.frames)) {
    return (
      atlas.frames.find((f) => f.filename === key || f.name === key) || null
    );
  }
  // object map
  return atlas.frames[key] || atlas.frames[key + ".png"] || null;
}

async function composeExtracted(chunkBuffer, frameEntry) {
  // If trimmed/rotated we may need to place chunk into original sourceSize canvas
  const rotated = !!frameEntry.rotated;
  const trimmed = !!frameEntry.trimmed || !!frameEntry.trim;
  const spriteSourceSize =
    frameEntry.spriteSourceSize || frameEntry.sprite_source_size || null;
  const sourceSize = frameEntry.sourceSize || frameEntry.source_size || null;

  let img = sharp(chunkBuffer);

  if (rotated) {
    // many atlas tools rotate 90deg clockwise when packing; rotate back
    img = img.rotate(90);
  }

  if (trimmed && spriteSourceSize && sourceSize) {
    // create a transparent canvas of sourceSize and composite the chunk at spriteSourceSize offsets
    const base = sharp({
      create: {
        width: sourceSize.w,
        height: sourceSize.h,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });
    const chunkBuf = await img.png().toBuffer();
    const left = spriteSourceSize.x || 0;
    const top = spriteSourceSize.y || 0;
    const composed = await base
      .composite([{ input: chunkBuf, left, top }])
      .png()
      .toBuffer();
    return composed;
  }

  return img.png().toBuffer();
}

async function pack(stage) {
  console.log("Packing stage", stage);
  const atlasJsonPath = path.join(ATLAS_DIR, `jr_${stage}.json`);
  const atlasPngPath = path.join(ATLAS_DIR, `jr_${stage}.png`);
  if (!fs.existsSync(atlasJsonPath) || !fs.existsSync(atlasPngPath)) {
    console.warn(
      "  Missing atlas files for",
      stage,
      `(expected ${atlasJsonPath} and ${atlasPngPath})`,
    );
    return;
  }

  let atlas;
  try {
    atlas = JSON.parse(fs.readFileSync(atlasJsonPath, "utf8"));
  } catch (err) {
    console.warn("  Failed to parse atlas JSON for", stage, err.message);
    return;
  }

  const outW = COLS * FRAME_W;
  const outH = ROWS.length * FRAME_H;

  // Prepare empty base image
  let canvas = sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
  const composites = [];

  for (let rowIndex = 0; rowIndex < ROWS.length; rowIndex++) {
    const anim = ROWS[rowIndex];
    const frameCount = FRAMES_BY_ANIM[anim] || 0;
    for (let i = 0; i < frameCount; i++) {
      const key = `jr_${stage}_clean_normal_neutral_${anim}_${pad(i)}`;
      const frameEntry = getFrameEntry(atlas, key);
      if (!frameEntry) {
        // missing frame -> skip but log once
        console.debug(`  [skip] ${key} not found in atlas`);
        continue;
      }

      // normalize access to frame rect (support different naming)
      const rect = frameEntry.frame || frameEntry.rect || null;
      if (!rect || typeof rect.x !== "number") {
        console.warn(`  [skip] ${key} missing frame rect`);
        continue;
      }

      const sx = rect.x;
      const sy = rect.y;
      const sw = rect.w;
      const sh = rect.h;

      try {
        // extract region; if rotated many atlases still store rotated rectangle in png
        const extracted = await sharp(atlasPngPath)
          .extract({
            left: Math.max(0, sx),
            top: Math.max(0, sy),
            width: Math.max(1, sw),
            height: Math.max(1, sh),
          })
          .png()
          .toBuffer();

        // fix rotated/trimmed into original source canvas before resizing
        const fixed = await composeExtracted(extracted, frameEntry);

        // finally resize to FRAME_W x FRAME_H preserving aspect (contain) with transparency
        const chunk = await sharp(fixed)
          .resize(FRAME_W, FRAME_H, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer();

        const dx = (i % COLS) * FRAME_W;
        const dy = rowIndex * FRAME_H;
        composites.push({ input: chunk, left: dx, top: dy });
      } catch (err) {
        console.warn(`  [error] failed to process ${key}:`, err.message);
        // continue with others
      }
    }
  }

  if (composites.length === 0) {
    console.warn("No frames packed for", stage);
    return;
  }

  const outPath = path.join(OUT_DIR, `${stage}_clean.png`);
  try {
    await canvas.composite(composites).png().toFile(outPath);
    console.log("Wrote", outPath);
  } catch (err) {
    console.error("Failed to write output for", stage, err);
  }
}

(async () => {
  try {
    for (const s of STAGES) {
      await pack(s);
    }
    console.log("Done packing sprites.");
    process.exit(0);
  } catch (err) {
    console.error("Packing failed:", err);
    process.exit(1);
  }
})();
