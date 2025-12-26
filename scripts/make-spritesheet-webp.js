/** @format */

/**
 * scripts/make-spritesheet-webp.js
 *
 * Generates WebP versions of sprite sheet PNGs (non-destructive).
 * Writes outputs to a separate folder so you can test performance safely.
 *
 * Default:
 *   input:  public/sprites
 *   output: public/optimized-sprites
 *
 * Usage:
 *   node scripts/make-spritesheet-webp.js
 *   node scripts/make-spritesheet-webp.js --quality 82 --effort 5
 *   node scripts/make-spritesheet-webp.js --dir public/sprites --out public/optimized-sprites
 *   node scripts/make-spritesheet-webp.js --minKB 200
 *   node scripts/make-spritesheet-webp.js --dryRun
 *
 * Notes:
 * - This script does NOT update your in-app references or your service worker cache list.
 * - After verifying visuals + performance, you can swap URLs one sprite at a time.
 */

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    dir: 'public/sprites',
    out: 'public/optimized-sprites',
    quality: 82,
    effort: 5,
    minKB: 120,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dir') args.dir = String(argv[++i] ?? args.dir);
    else if (a === '--out') args.out = String(argv[++i] ?? args.out);
    else if (a === '--quality')
      args.quality = Number(argv[++i] ?? args.quality);
    else if (a === '--effort') args.effort = Number(argv[++i] ?? args.effort);
    else if (a === '--minKB') args.minKB = Number(argv[++i] ?? args.minKB);
    else if (a === '--dryRun') args.dryRun = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }

  if (!Number.isFinite(args.quality) || args.quality < 1 || args.quality > 100)
    args.quality = 82;
  if (!Number.isFinite(args.effort) || args.effort < 0 || args.effort > 6)
    args.effort = 5;
  if (!Number.isFinite(args.minKB) || args.minKB < 0) args.minKB = 120;

  return args;
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
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

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function usage() {
  console.log(
    `\nDoggerz sprite WebP generator\n\n` +
      `Non-destructively writes WebP versions of sprite sheets into an output folder.\n\n` +
      `Options:\n` +
      `  --dir <path>     Input directory (default: public/sprites)\n` +
      `  --out <path>     Output directory (default: public/optimized-sprites)\n` +
      `  --quality <1-100>  WebP quality (default: 82)\n` +
      `  --effort <0-6>     WebP effort (default: 5)\n` +
      `  --minKB <n>      Only process PNGs >= n KB (default: 120)\n` +
      `  --dryRun         Print planned outputs without writing files\n` +
      `  --help           Show this help\n`
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const inDir = path.join(ROOT, args.dir);
  const outDir = path.join(ROOT, args.out);

  if (!fs.existsSync(inDir)) {
    console.error(`[Doggerz] Input dir not found: ${inDir}`);
    process.exit(1);
  }

  ensureDir(outDir);

  const files = [];
  walk(inDir, files);

  const minBytes = args.minKB * 1024;
  const candidates = files.filter((p) => {
    if (path.extname(p).toLowerCase() !== '.png') return false;
    const st = fs.statSync(p);
    return st.size >= minBytes;
  });

  if (candidates.length === 0) {
    console.log(
      '[Doggerz] No PNG sprite sheets matched (try lowering --minKB).'
    );
    return;
  }

  console.log(
    `[Doggerz] Generating WebP sprites for ${candidates.length} file(s)`
  );
  console.log(
    `[Doggerz] in=${args.dir} out=${args.out} quality=${args.quality} effort=${
      args.effort
    } minKB=${args.minKB} dryRun=${args.dryRun ? 'yes' : 'no'}`
  );

  let totalBefore = 0;
  let totalAfter = 0;

  for (const src of candidates) {
    const rel = path.relative(inDir, src);
    const dst = path.join(outDir, rel.replace(/\.png$/i, '.webp'));
    ensureDir(path.dirname(dst));

    const before = fs.statSync(src).size;
    totalBefore += before;

    const relSrc = path.relative(ROOT, src).split(path.sep).join('/');
    const relDst = path.relative(ROOT, dst).split(path.sep).join('/');

    if (args.dryRun) {
      console.log(`[dryRun] ${relSrc} -> ${relDst}`);
      continue;
    }

    // WebP keeps alpha if needed; great for sprites.
    await sharp(src)
      .webp({ quality: args.quality, effort: args.effort })
      .toFile(dst);

    const after = fs.statSync(dst).size;
    totalAfter += after;

    const saved = before - after;
    const pct = before ? ((saved / before) * 100).toFixed(1) : '0.0';
    console.log(
      `${relSrc} -> ${relDst}  (${fmt(before)} -> ${fmt(after)}, saved ${fmt(
        saved
      )} / ${pct}%)`
    );
  }

  if (!args.dryRun) {
    console.log(`\n[Doggerz] Total input size:  ${fmt(totalBefore)}`);
    console.log(`[Doggerz] Total output size: ${fmt(totalAfter)}`);
    console.log(
      `[Doggerz] Total saved:       ${fmt(totalBefore - totalAfter)}`
    );
    console.log(
      '\nNext: swap one sprite URL at a time and update public/sw.js CORE_ASSETS if you want them precached.'
    );
  }
}

main().catch((err) => {
  console.error('[Doggerz] make-spritesheet-webp failed:', err);
  process.exit(1);
});
