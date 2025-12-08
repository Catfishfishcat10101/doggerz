#!/usr/bin/env node
// scripts/check-sw-assets.mjs
// Verifies that files referenced in public/sw.js CORE_ASSETS exist in public/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(__filename, "..", "..");
const publicDir = path.join(repoRoot, "public");
const swPath = path.join(publicDir, "sw.js");

function readSw() {
  if (!fs.existsSync(swPath)) {
    console.error("Could not find", swPath);
    process.exit(2);
  }
  return fs.readFileSync(swPath, "utf8");
}

function extractCoreAssets(swText) {
  // naive: find CORE_ASSETS = [ ... ]; and parse string literals
  const m = /CORE_ASSETS\s*=\s*\[([\s\S]*?)\];/m.exec(swText);
  if (!m) return null;
  const inner = m[1];
  // match JS string literals (single or double quotes)
  const re = /(['"])(.*?)\1/g;
  const assets = [];
  let mm;
  while ((mm = re.exec(inner)) !== null) {
    assets.push(mm[2]);
  }
  return assets;
}

function normalizeAsset(a) {
  // remove leading public/ if present and ensure path starts with /
  let p = a.replace(/^public\//, "");
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

async function main() {
  const swText = readSw();
  const assets = extractCoreAssets(swText);
  if (!assets) {
    console.error("Could not find CORE_ASSETS array in public/sw.js");
    process.exit(2);
  }

  const results = assets.map((a) => {
    const normalized = normalizeAsset(a);
    const fsPath = path.join(publicDir, normalized.replace(/^\//, ""));
    const exists = fs.existsSync(fsPath);
    return { asset: a, normalized, fsPath, exists };
  });

  console.log("Found", results.length, "CORE_ASSETS entries in public/sw.js");
  let missing = 0;
  for (const r of results) {
    if (!r.exists) {
      console.log("MISSING:", r.normalized, "->", r.fsPath);
      missing++;
    } else {
      console.log("OK     :", r.normalized);
    }
  }

  if (missing) {
    console.error("\nSummary:", missing, "asset(s) missing under public/");
    process.exit(3);
  }
  console.log("\nAll CORE_ASSETS exist.");
}

main().catch((err) => {
  console.error("Error:", err && err.message ? err.message : err);
  process.exit(1);
});
