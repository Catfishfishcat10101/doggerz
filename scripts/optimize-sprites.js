// scripts/optimize-sprites.js
// Compress PNG sprites and generate WebP variants. Back up originals to tmp/opt-backup.
// Usage:
//   node scripts/optimize-sprites.js
// Options: set environment variable DRY_RUN=1 to preview without writing.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = path.resolve(__dirname, "../src/assets/sprites/jackrussell");
const BACKUP_DIR = path.resolve(
  __dirname,
  "../tmp/opt-backup/sprites/jackrussell",
);
const dryRun = !!process.env.DRY_RUN;

if (!fs.existsSync(SRC_DIR)) {
  console.error("Sprites source directory not found:", SRC_DIR);
  process.exit(1);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function processFile(filename) {
  const srcPath = path.join(SRC_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);

  if (ext !== ".png") return;

  const backupPath = path.join(BACKUP_DIR, filename);
  ensureDir(path.dirname(backupPath));

  if (!dryRun) {
    // Backup original if not already backed up
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(srcPath, backupPath);
      console.log("Backed up:", filename);
    } else {
      console.log("Backup exists:", filename);
    }
  } else {
    console.log("[dry] Would back up:", filename);
  }

  // Compress PNG: use sharp to optimize and rewrite in place (lossless-ish)
  const optimizedPath = srcPath; // overwrite
  if (!dryRun) {
    try {
      await sharp(srcPath)
        .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
        .toBuffer()
        .then((data) => fs.writeFileSync(optimizedPath, data));
      console.log("Optimized PNG:", filename);
    } catch (err) {
      console.warn("Failed to optimize PNG", filename, err.message || err);
    }
  } else {
    console.log("[dry] Would optimize PNG:", filename);
  }

  // Generate WebP sibling file with quality=85
  const webpName = `${base}.webp`;
  const webpPath = path.join(SRC_DIR, webpName);
  if (!dryRun) {
    try {
      await sharp(srcPath).webp({ quality: 85 }).toFile(webpPath);
      console.log("Generated WebP:", webpName);
    } catch (err) {
      console.warn("Failed to generate WebP for", filename, err.message || err);
    }
  } else {
    console.log("[dry] Would generate WebP:", webpName);
  }
}

async function main() {
  ensureDir(BACKUP_DIR);
  const files = fs.readdirSync(SRC_DIR);
  const pngs = files.filter((f) => f.toLowerCase().endsWith(".png"));
  console.log("Found PNG sprites:", pngs.length);

  for (const f of pngs) {
    // skip very large background images if any
    if (f.toLowerCase().includes("backyard")) continue;
    await processFile(f);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error optimizing sprites:", err);
  process.exit(1);
});
