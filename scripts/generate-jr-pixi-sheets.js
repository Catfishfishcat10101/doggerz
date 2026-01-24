/**
 * eslint-disable no-console
 * @format
 */

// scripts/generate-jr-pixi-sheets.js
// Builds Pixi-ready sprite sheets for Jack Russell animations.
// Output: public/sprites/jr/<stage>_<condition>.png
//
// Usage:
//   node scripts/generate-jr-pixi-sheets.js
//   node scripts/generate-jr-pixi-sheets.js --input betterspritesheet.png --out public/sprites/jr
//   node scripts/generate-jr-pixi-sheets.js --stages pup,adult,senior --conditions clean,dirty

const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(
  ROOT,
  "src",
  "features",
  "game",
  "sprites",
  "jrManifest.json"
);

const DEFAULT_INPUTS = [
  // Prefer an already-generated clean sheet so this script can run even after
  // we remove the original source PNGs from the repo.
  path.join(ROOT, "public", "sprites", "jr", "pup_clean.png"),
];

const argv = process.argv.slice(2);
function arg(name, def) {
  const prefix = `--${name}=`;
  const hit = argv.find((a) => a.startsWith(prefix));
  if (!hit) return def;
  return hit.slice(prefix.length);
}

function pickInput() {
  const cli = arg("input", "");
  if (cli) return path.resolve(ROOT, cli);
  for (const candidate of DEFAULT_INPUTS) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const inputPath = pickInput();
if (!inputPath) {
  console.error(
    "[sprites] Missing input sprite sheet. Provide --input=<path>."
  );
  process.exit(1);
}

const outDir = path.resolve(
  ROOT,
  arg("out", path.join("public", "sprites", "jr"))
);

const stages = arg("stages", "pup,adult,senior")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const conditions = arg("conditions", "clean,dirty,fleas,mange")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch (err) {
    console.warn("[sprites] Failed to read manifest:", err.message);
    return null;
  }
}

const manifest = readManifest();

const CONDITION_TONES = {
  clean: null,
  dirty: { tint: { r: 110, g: 86, b: 60 }, alpha: 0.2 },
  fleas: { tint: { r: 80, g: 120, b: 70 }, alpha: 0.15 },
  mange: { tint: { r: 120, g: 120, b: 120 }, alpha: 0.22, saturate: 0.5 },
};

async function buildOverlay(width, height, tone) {
  if (!tone) return null;
  const color = tone.tint || { r: 0, g: 0, b: 0 };
  const alpha = Number(tone.alpha ?? 0);
  if (alpha <= 0) return null;

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: color.r, g: color.g, b: color.b, alpha },
    },
  })
    .png()
    .toBuffer();
}

async function writeSheet(stage, condition, overlay) {
  const outName = `${stage}_${condition}.png`;
  const outPath = path.join(outDir, outName);
  let pipeline = sharp(INPUT_BUFFER);

  if (condition === "mange" && CONDITION_TONES.mange?.saturate) {
    pipeline = pipeline.modulate({
      saturation: CONDITION_TONES.mange.saturate,
      brightness: 0.95,
    });
  }

  if (overlay) {
    pipeline = pipeline.composite([{ input: overlay, blend: "multiply" }]);
  }

  await pipeline.png().toFile(outPath);
  console.log(`[sprites] Wrote ${path.relative(ROOT, outPath)}`);
}

async function main() {
  await fs.promises.mkdir(outDir, { recursive: true });
  const baseMeta = await sharp(INPUT_BUFFER).metadata();

  if (manifest?.frame?.width && manifest?.frame?.height && manifest?.rows) {
    const expectedW = manifest.frame.width * (manifest.columns || 1);
    const expectedH = manifest.frame.height * manifest.rows.length;
    if (
      expectedW &&
      expectedH &&
      (baseMeta.width !== expectedW || baseMeta.height !== expectedH)
    ) {
      console.warn(
        `[sprites] Sheet size ${baseMeta.width}x${baseMeta.height} does not match manifest ${expectedW}x${expectedH}`
      );
    }
  }

  const overlays = {};
  for (const condition of conditions) {
    const tone = CONDITION_TONES[condition] || null;
    overlays[condition] = await buildOverlay(
      baseMeta.width,
      baseMeta.height,
      tone
    );
  }

  for (const stage of stages) {
    for (const condition of conditions) {
      await writeSheet(stage, condition, overlays[condition]);
    }
  }

  console.log("[sprites] Done.");
}

// If the input lives under the output directory, avoid in-place read/write
// hazards by loading it once up front.
const INPUT_BUFFER = fs.readFileSync(inputPath);

main().catch((err) => {
  console.error("[sprites] Failed:", err);
  process.exit(1);
});
