#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const SRC_DIR = path.join(ROOT, "src");
const SOURCE_EXTS = new Set([".js", ".jsx", ".ts", ".tsx", ".html", ".json"]);
const ASSET_PREFIXES = ["/assets/", "/audio/", "assets/", "audio/"];
const ASSET_FILE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".json",
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, out);
      continue;
    }
    if (SOURCE_EXTS.has(path.extname(entry.name))) out.push(abs);
  }
  return out;
}

function normalizeCandidate(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return null;
  if (value.includes("${")) return null;
  const clean = value.split("?")[0].split("#")[0];
  if (!clean) return null;
  for (const prefix of ASSET_PREFIXES) {
    if (clean.startsWith(prefix)) {
      const normalized = clean.replace(/^\//, "");
      const ext = path.extname(normalized).toLowerCase();
      if (!ASSET_FILE_EXTS.has(ext)) return null;
      return normalized;
    }
  }
  return null;
}

function collectReferencedAssets(text) {
  const found = new Set();
  const stringRx = /["'`]([^"'`]+(?:assets|audio)\/[^"'`]+)["'`]/g;
  let m;
  while ((m = stringRx.exec(text))) {
    const normalized = normalizeCandidate(m[1]);
    if (normalized) found.add(normalized);
  }
  return found;
}

function checkReadable(file) {
  const stat = fs.statSync(file);
  if (stat.size <= 0) throw new Error(`${file} is empty`);
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error(`Missing public directory: ${PUBLIC_DIR}`);
  }

  const files = walk(SRC_DIR);
  const refs = new Set();

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const asset of collectReferencedAssets(text)) refs.add(asset);
  }

  const missing = [];
  const unreadable = [];
  for (const rel of refs) {
    const abs = path.join(PUBLIC_DIR, rel);
    if (!fs.existsSync(abs)) {
      missing.push(rel);
      continue;
    }
    try {
      checkReadable(abs);
    } catch {
      unreadable.push(rel);
    }
  }

  if (missing.length || unreadable.length) {
    const lines = [];
    if (missing.length) {
      lines.push("Missing asset files:");
      for (const m of missing) lines.push(`- ${m}`);
    }
    if (unreadable.length) {
      lines.push("Unreadable/empty asset files:");
      for (const u of unreadable) lines.push(`- ${u}`);
    }
    throw new Error(lines.join("\n"));
  }

  console.log(`[assets:verify] OK - verified ${refs.size} referenced assets.`);
}

try {
  main();
} catch (error) {
  console.error(`[assets:verify] FAILED\n${error.message}`);
  process.exit(1);
}
