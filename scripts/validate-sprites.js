/* validate-sprites.js */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

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

function main() {
  process.exitCode = 0;

  for (const rel of REQUIRED_STATIC) {
    const abs = path.join(ROOT, rel);
    if (!exists(abs)) fail(`Missing static sprite: ${rel}`);
  }

  for (const stage of STAGES) {
    for (const condition of CONDITIONS) {
      const rel = `public/sprites/jr/${stage}_${condition}.png`;
      const abs = path.join(ROOT, rel);
      if (!exists(abs)) fail(`Missing Pixi sheet: ${rel}`);
    }
  }

  if (!process.exitCode) ok("All required sprites present.");
}

main();
