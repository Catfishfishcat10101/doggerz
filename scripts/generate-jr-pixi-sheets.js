// scripts/generate-jr-pixi-sheets.js
// Builds Pixi-ready JR sprite strips from frame folders into public/assets/sprites/jr.

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const FRAMES_DIR = path.join(ROOT, "public", "assets", "frames", "jr");
const OUT_DIR = path.join(ROOT, "public", "assets", "sprites", "jr");
const MANIFEST_PATH = path.join(
  ROOT,
  "src",
  "features",
  "game",
  "jrManifest.json"
);

const STAGES = ["pup", "adult", "senior"];
const CONDITION = "clean";
const EXTRA_CONDITIONS = ["dirty", "fleas", "mange"];

const SOURCE_ANIM_MAP = {
  wag: "shake",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return {
    frameW: Number(parsed?.frame?.width || 128),
    frameH: Number(parsed?.frame?.height || 128),
    columns: Number(parsed?.columns || 8),
    rows: Array.isArray(parsed?.rows) ? parsed.rows : [],
  };
}

function framePathFor(stage, anim, frameIndex) {
  const idx = String(frameIndex).padStart(2, "0");
  const filename = `jr_${stage}_${CONDITION}_normal_neutral_${anim}_${idx}.png`;
  return path.join(FRAMES_DIR, filename);
}

async function readFrameBuffer(srcPath, frameW, frameH) {
  return sharp(srcPath)
    .resize(frameW, frameH, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function buildStageSheet(stage, cfg) {
  const { frameW, frameH, columns, rows } = cfg;
  const canvasW = columns * frameW;
  const canvasH = rows.length * frameH;
  const composites = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || {};
    const anim = String(row.anim || "")
      .trim()
      .toLowerCase();
    const sourceAnim = SOURCE_ANIM_MAP[anim] || anim;
    const frames = Math.max(1, Number(row.frames || 1));

    for (let frameIndex = 0; frameIndex < frames; frameIndex += 1) {
      let srcPath = framePathFor(stage, sourceAnim, frameIndex);
      if (!fs.existsSync(srcPath)) {
        const fallback = framePathFor(stage, sourceAnim, 0);
        if (!fs.existsSync(fallback)) {
          continue;
        }
        srcPath = fallback;
      }

      const buffer = await readFrameBuffer(srcPath, frameW, frameH);
      composites.push({
        input: buffer,
        left: frameIndex * frameW,
        top: rowIndex * frameH,
      });
    }
  }

  if (!composites.length) {
    throw new Error(`No source frames found for stage '${stage}'.`);
  }

  const outFile = path.join(OUT_DIR, `${stage}_${CONDITION}.png`);
  await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outFile);

  return outFile;
}

async function main() {
  if (!fs.existsSync(FRAMES_DIR)) {
    throw new Error(`Frames directory not found: ${FRAMES_DIR}`);
  }

  ensureDir(OUT_DIR);

  const cfg = readManifest();
  const outputs = [];

  for (const stage of STAGES) {
    const outFile = await buildStageSheet(stage, cfg);
    outputs.push(outFile);
    for (const cond of EXTRA_CONDITIONS) {
      const extraOut = path.join(OUT_DIR, `${stage}_${cond}.png`);
      fs.copyFileSync(outFile, extraOut);
      outputs.push(extraOut);
    }
  }

  console.log("Generated Pixi sheets:");
  outputs.forEach((f) => console.log(` - ${path.relative(ROOT, f)}`));
}

main().catch((err) => {
  console.error("[generate-jr-pixi-sheets] failed:", err?.message || err);
  process.exitCode = 1;
});
