/* validate-sprites.js */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(
  ROOT,
  "public",
  "sprites",
  "anim",
  "jrt",
  "manifest.json"
);

const REQUIRED_STAGES = ["puppy", "adult", "senior"];
const REQUIRED_ANIMS = ["idle", "walk", "run", "sleep"];

function fail(msg) {
  console.error(`[sprites] ERROR: ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`[sprites] OK: ${msg}`);
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (!exists(MANIFEST)) {
    fail(`Missing manifest: ${path.relative(ROOT, MANIFEST)}`);
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch (e) {
    fail(
      `Manifest invalid JSON: ${path.relative(ROOT, MANIFEST)} (${e.message})`
    );
    return;
  }

  if (!manifest?.frameSize || !manifest?.stages || !manifest?.anims) {
    console.warn(
      "[sprites] WARN: manifest missing expected keys (frameSize/stages/anims)."
    );
  }

  for (const stage of REQUIRED_STAGES) {
    for (const anim of REQUIRED_ANIMS) {
      const p = path.join(
        ROOT,
        "public",
        "sprites",
        "anim",
        "jrt",
        stage,
        `${anim}.webp`
      );
      if (!exists(p)) fail(`Missing strip: ${path.relative(ROOT, p)}`);
    }
  }

  for (const stage of REQUIRED_STAGES) {
    const p = path.join(ROOT, "public", "sprites", `jrt_${stage}.webp`);
    if (!exists(p)) fail(`Missing fallback: ${path.relative(ROOT, p)}`);
  }

  if (!process.exitCode) ok("All required sprites present.");
}

main();
