/* validate-sprites.js */
const fs = require("node:fs");
const path = require("node:path");
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

const REQUIRED_STATIC = [
  "public/sprites/jack_russell_puppy.webp",
  "public/sprites/jack_russell_adult.webp",
  "public/sprites/jack_russell_senior.webp",
];

const STAGES = ["pup", "adult", "senior"];
const CONDITIONS = ["clean", "dirty", "fleas", "mange"];

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function fail(msg) {
  console.error(`[sprites] ERROR: ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`[sprites] OK: ${msg}`);
}

function readManifest() {
  if (!exists(MANIFEST_PATH)) {
    fail(`Missing jrManifest.json: ${path.relative(ROOT, MANIFEST_PATH)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch (e) {
    fail(
      `Invalid JSON jrManifest.json: ${path.relative(ROOT, MANIFEST_PATH)} (${e.message})`
    );
    return null;
  }
}

async function validatePngSize(relPath, expectedW, expectedH) {
  const abs = path.join(ROOT, relPath);
  if (!exists(abs)) {
    fail(`Missing Pixi sheet: ${relPath}`);
    return;
  }
  try {
    const meta = await sharp(abs).metadata();
    if (meta.width !== expectedW || meta.height !== expectedH) {
      fail(
        `Bad sheet size for ${relPath}: ${meta.width}x${meta.height} (expected ${expectedW}x${expectedH})`
      );
    }
  } catch (e) {
    fail(`Could not read image metadata: ${relPath} (${e.message})`);
  }
}

async function main() {
  process.exitCode = 0;

  const manifest = readManifest();
  if (!manifest) return;

  const frameW = Number(manifest?.frame?.width || 0);
  const frameH = Number(manifest?.frame?.height || 0);
  const columns = Number(manifest?.columns || 0);
  const rows = Array.isArray(manifest?.rows) ? manifest.rows : [];

  if (!frameW || !frameH || !columns || rows.length === 0) {
    fail(
      "jrManifest.json missing expected keys (frame.width/height, columns, rows)."
    );
    return;
  }

  const expectedW = frameW * columns;
  const expectedH = frameH * rows.length;

  for (const rel of REQUIRED_STATIC) {
    const abs = path.join(ROOT, rel);
    if (!exists(abs)) fail(`Missing static sprite: ${rel}`);
  }

  await Promise.all(
    STAGES.flatMap((stage) =>
      CONDITIONS.map((condition) =>
        validatePngSize(
          `public/sprites/jr/${stage}_${condition}.png`,
          expectedW,
          expectedH
        )
      )
    )
  );

  if (!process.exitCode) ok("All required sprites present.");
}

main().catch((e) => {
  fail(e?.message || String(e));
});
