/** @format */

/**
 * scripts/optimize-images.js
 *
 * Generates WebP versions of images for performance testing.
 * Non-destructive by default: writes into /public/optimized preserving folders.
 *
 * Usage:
 *   node scripts/optimize-images.js
 *   node scripts/optimize-images.js --quality 82
 *   node scripts/optimize-images.js --dir public/backgrounds --out public/optimized
 *
 * Notes:
 * - This script does NOT update any imports/URLs in your app.
 * - After reviewing results, you can switch references manually where safe.
 */

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    dir: 'public',
    out: 'public/optimized',
    quality: 82,
    effort: 5,
    minKB: 80,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dir') args.dir = String(argv[++i] ?? args.dir);
    else if (a === '--out') args.out = String(argv[++i] ?? args.out);
    else if (a === '--quality')
      args.quality = Number(argv[++i] ?? args.quality);
    else if (a === '--effort') args.effort = Number(argv[++i] ?? args.effort);
    else if (a === '--minKB') args.minKB = Number(argv[++i] ?? args.minKB);
  }

  if (!Number.isFinite(args.quality) || args.quality < 1 || args.quality > 100)
    args.quality = 82;
  if (!Number.isFinite(args.effort) || args.effort < 0 || args.effort > 6)
    args.effort = 5;
  if (!Number.isFinite(args.minKB) || args.minKB < 0) args.minKB = 80;

  return args;
}

function walk(dir, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git')
        continue;
      walk(p, results);
    } else if (e.isFile()) {
      results.push(p);
    }
  }
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inDir = path.join(ROOT, args.dir);
  const outDir = path.join(ROOT, args.out);

  if (!fs.existsSync(inDir)) {
    console.error(`[Doggerz] Input dir not found: ${inDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const files = [];
  walk(inDir, files);

  const minBytes = args.minKB * 1024;
  const candidates = files.filter((p) => {
    const ext = path.extname(p).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) return false;
    const st = fs.statSync(p);
    return st.size >= minBytes;
  });

  if (candidates.length === 0) {
    console.log('[Doggerz] No images matched (try lowering --minKB).');
    return;
  }

  let savedTotal = 0;
  console.log(
    `[Doggerz] Optimizing ${candidates.length} image(s) -> ${args.out}`
  );

  for (const src of candidates) {
    const relFromIn = path.relative(inDir, src);
    const relOut = relFromIn.replace(/\.(png|jpe?g)$/i, '.webp');
    const dst = path.join(outDir, relOut);

    fs.mkdirSync(path.dirname(dst), { recursive: true });

    const before = fs.statSync(src).size;

    // Keep alpha if present (sharp handles it for WebP)
    await sharp(src)
      .webp({ quality: args.quality, effort: args.effort })
      .toFile(dst);

    const after = fs.statSync(dst).size;
    const saved = before - after;
    savedTotal += saved;

    const relSrc = path.relative(ROOT, src).split(path.sep).join('/');
    const relDst = path.relative(ROOT, dst).split(path.sep).join('/');

    const pct = before ? ((saved / before) * 100).toFixed(1) : '0.0';
    console.log(
      `${relSrc} -> ${relDst}  (${fmt(before)} -> ${fmt(after)}, saved ${fmt(
        saved
      )} / ${pct}%)`
    );
  }

  console.log(
    `\n[Doggerz] Total saved across generated WebPs: ${fmt(savedTotal)}`
  );
  console.log(
    'Next: if results look good, swap references for backgrounds first (safe win).'
  );
}

main().catch((err) => {
  console.error('[Doggerz] optimize-images failed:', err);
  process.exit(1);
});
