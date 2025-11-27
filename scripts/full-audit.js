#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "tmp");
const outFile = path.join(outDir, "full-audit.json");

const IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "tmp",
  "public/build",
  "android",
  "ios",
  ".vite",
];

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
const TEXT_EXTS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".html",
  ".md",
];

function walk(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    const rel = path.relative(repoRoot, p);
    if (IGNORE.some((i) => rel.split(path.sep).includes(i))) continue;
    if (e.isDirectory()) {
      results.push(...walk(p));
    } else {
      results.push(p);
    }
  }
  return results;
}

function sha256File(file) {
  const data = fs.readFileSync(file);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function isBinary(file) {
  // simple heuristic: if it has NUL byte, treat binary
  const buf = fs.readFileSync(file, { encoding: "binary" });
  return buf.indexOf("\u0000") >= 0;
}

(async function main() {
  console.log("Scanning repository...");
  const allFiles = walk(repoRoot);
  console.log("Total files found:", allFiles.length);

  const files = [];
  for (const f of allFiles) {
    const stat = fs.statSync(f);
    if (!stat.isFile()) continue;
    const rel = path.relative(repoRoot, f);
    const ext = path.extname(f).toLowerCase();
    const size = stat.size;
    let hash = null;
    try {
      hash = sha256File(f);
    } catch (e) {
      hash = null;
    }
    files.push({ path: rel, abs: f, size, ext, hash });
  }

  // exact duplicates by hash
  const hashGroups = {};
  for (const f of files) {
    if (!f.hash) continue;
    hashGroups[f.hash] = hashGroups[f.hash] || [];
    hashGroups[f.hash].push(f.path);
  }
  const exactDuplicates = Object.entries(hashGroups)
    .filter(([h, arr]) => arr.length > 1)
    .map(([h, arr]) => ({ hash: h, files: arr }));

  // large files > 500KB
  const LARGE_THRESHOLD = 500 * 1024;
  const largeFiles = files
    .filter((f) => f.size >= LARGE_THRESHOLD)
    .map((f) => ({ path: f.path, size: f.size }));

  // attempt image heuristics (dimensions) if image-size is available
  let sizeOf = null;
  try {
    sizeOf = require("image-size");
  } catch (e) {
    sizeOf = null;
  }
  const images = files.filter((f) => IMAGE_EXTS.includes(f.ext));
  const imageInfo = [];
  for (const img of images) {
    let dims = null;
    if (sizeOf) {
      try {
        dims = sizeOf(img.abs);
      } catch (e) {
        dims = null;
      }
    }
    imageInfo.push({
      path: img.path,
      size: img.size,
      ext: img.ext,
      width: dims && dims.width,
      height: dims && dims.height,
    });
  }

  // similar images: same dimensions and similar size (within 6%)
  const similarGroups = [];
  if (sizeOf) {
    const byDim = {};
    for (const img of imageInfo) {
      const key = `${img.width}x${img.height}`;
      byDim[key] = byDim[key] || [];
      byDim[key].push(img);
    }
    for (const [k, arr] of Object.entries(byDim)) {
      if (arr.length < 2) continue;
      // cluster by file size proximity
      arr.sort((a, b) => a.size - b.size);
      let group = [arr[0]];
      for (let i = 1; i < arr.length; i++) {
        const prev = group[group.length - 1];
        const cur = arr[i];
        const ratio =
          Math.abs(cur.size - prev.size) / Math.max(cur.size, prev.size);
        if (ratio <= 0.06) {
          group.push(cur);
        } else {
          if (group.length > 1) similarGroups.push(group.map((x) => x.path));
          group = [cur];
        }
      }
      if (group.length > 1) similarGroups.push(group.map((x) => x.path));
    }
  }

  // usage search: for each file, search source files for occurrences of its basename
  const searchTargets = files.filter(
    (f) =>
      f.path.startsWith("src") ||
      f.path.startsWith("public") ||
      f.path.startsWith("routes") ||
      f.path.startsWith("pages"),
  );
  const textSearchFiles = allFiles.filter((p) =>
    TEXT_EXTS.includes(path.extname(p).toLowerCase()),
  );
  const usage = {};
  for (const f of searchTargets) {
    const base = path.basename(f.path);
    usage[f.path] = [];
    for (const sf of textSearchFiles) {
      const content = fs.readFileSync(sf, "utf8");
      if (
        content.includes(base) ||
        content.includes(f.path) ||
        content.includes(f.path.replace(/\\/g, "/"))
      ) {
        usage[f.path].push(path.relative(repoRoot, sf));
      }
    }
  }

  const unusedFiles = Object.entries(usage)
    .filter(([p, arr]) => arr.length === 0)
    .map(([p]) => p);

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      files: files.length,
      images: images.length,
      largeFiles: largeFiles.length,
      duplicates: exactDuplicates.length,
    },
    largeFiles,
    exactDuplicates,
    similarGroups,
    imageInfo,
    unusedFiles,
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log("Audit written to", outFile);
})();
