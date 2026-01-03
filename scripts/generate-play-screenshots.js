#!/usr/bin/env node
/*
  Generate Google Play screenshots from raw captures.

  Requirements (Google Play):
  - 4–8 screenshots
  - PNG or JPEG
  - up to 15 MB each
  - 16:9 or 9:16
  - each side between 720 px and 7680 px

  Defaults here target safe, common phone landscape: 1920x1080 JPEG.

  Usage examples:
    node scripts/generate-play-screenshots.js
    node scripts/generate-play-screenshots.js --preset phone-portrait
    node scripts/generate-play-screenshots.js --in store-assets/play/screenshots-in --out store-assets/play/screenshots-out --preset phone-landscape --format jpg

  Input:
    store-assets/play/screenshots-in/*.{png,jpg,jpeg,webp}

  Output:
    store-assets/play/screenshots-out/shot-01.jpg ...
*/

const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_IN_DIR = path.join('store-assets', 'play', 'screenshots-in');
const DEFAULT_OUT_DIR = path.join('store-assets', 'play', 'screenshots-out');

const PRESETS = {
  'phone-landscape': { width: 1920, height: 1080 }, // 16:9
  'phone-portrait': { width: 1080, height: 1920 }, // 9:16
  'tablet-landscape': { width: 2560, height: 1440 }, // 16:9 (bigger)
  'tablet-portrait': { width: 1440, height: 2560 }, // 9:16
};

function parseArgs(argv) {
  const args = {
    inDir: DEFAULT_IN_DIR,
    outDir: DEFAULT_OUT_DIR,
    preset: 'phone-landscape',
    width: undefined,
    height: undefined,
    format: 'jpg',
    quality: 90,
    limit: 8,
    fit: 'cover',
    position: 'attention',
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];

    const takeValue = () => {
      if (!next || next.startsWith('--')) throw new Error(`Missing value for ${a}`);
      i++;
      return next;
    };

    if (a === '--in' || a === '--inDir') args.inDir = takeValue();
    else if (a === '--out' || a === '--outDir') args.outDir = takeValue();
    else if (a === '--preset') args.preset = takeValue();
    else if (a === '--width') args.width = Number(takeValue());
    else if (a === '--height') args.height = Number(takeValue());
    else if (a === '--format') args.format = takeValue().toLowerCase();
    else if (a === '--quality') args.quality = Number(takeValue());
    else if (a === '--limit') args.limit = Number(takeValue());
    else if (a === '--fit') args.fit = takeValue();
    else if (a === '--position') args.position = takeValue();
    else if (a === '--help' || a === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }

  return args;
}

function printHelp() {
  const presets = Object.keys(PRESETS)
    .map((k) => `  - ${k}: ${PRESETS[k].width}x${PRESETS[k].height}`)
    .join('\n');

  // Keep this as plain text (no markdown), this is CLI output.
  console.log(`generate-play-screenshots\n\nOptions:\n  --in, --inDir       Input folder (default: ${DEFAULT_IN_DIR})\n  --out, --outDir     Output folder (default: ${DEFAULT_OUT_DIR})\n  --preset            One of: ${Object.keys(PRESETS).join(', ')}\n  --width             Override width\n  --height            Override height\n  --format            jpg|jpeg|png (default: jpg)\n  --quality           JPEG quality 1..100 (default: 90)\n  --limit             Max outputs to write (default: 8)\n  --fit               sharp fit (default: cover)\n  --position          sharp position (default: attention)\n\nPresets:\n${presets}\n\nExample:\n  node scripts/generate-play-screenshots.js --preset phone-portrait\n`);
}

function normalizeFormat(fmt) {
  if (fmt === 'jpeg') return 'jpg';
  return fmt;
}

function ensureWithinBounds(n, name) {
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid ${name}: ${n}`);
}

function aspectOk(w, h) {
  const ratio = w / h;
  const r169 = 16 / 9;
  const r916 = 9 / 16;
  const eps = 0.005;
  return Math.abs(ratio - r169) < eps || Math.abs(ratio - r916) < eps;
}

async function listInputFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e && e.code === 'ENOENT') return [];
    throw e;
  }

  const exts = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  return entries
    .filter((d) => d.isFile())
    .map((d) => path.join(dir, d.name))
    .filter((p) => exts.has(path.extname(p).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const preset = PRESETS[args.preset];
  if (!preset && (args.width == null || args.height == null)) {
    throw new Error(`Unknown preset: ${args.preset}. Use --help to see options.`);
  }

  const width = args.width ?? preset.width;
  const height = args.height ?? preset.height;

  ensureWithinBounds(width, 'width');
  ensureWithinBounds(height, 'height');

  if (!aspectOk(width, height)) {
    throw new Error(`Output size must be 16:9 or 9:16. Got ${width}x${height}.`);
  }

  if (width < 720 || height < 720 || width > 7680 || height > 7680) {
    throw new Error(
      `Output sides must be between 720 and 7680. Got ${width}x${height}.`
    );
  }

  const format = normalizeFormat(args.format);
  if (!['jpg', 'png'].includes(format)) {
    throw new Error(`Unsupported --format ${args.format}. Use jpg or png.`);
  }

  const inputFiles = await listInputFiles(args.inDir);
  if (inputFiles.length === 0) {
    console.log(
      `No input images found in: ${args.inDir}\n` +
        `Add 4–8 captures as PNG/JPG (or WEBP) and re-run.\n` +
        `Example path: ${DEFAULT_IN_DIR}`
    );
    return;
  }

  await fs.mkdir(args.outDir, { recursive: true });

  const take = Math.min(args.limit, inputFiles.length);
  const writes = [];

  for (let idx = 0; idx < take; idx++) {
    const inputPath = inputFiles[idx];
    const outName = `shot-${String(idx + 1).padStart(2, '0')}.${format}`;
    const outPath = path.join(args.outDir, outName);

    let pipeline = sharp(inputPath, { failOn: 'none' })
      .rotate() // respect EXIF
      .resize(width, height, {
        fit: args.fit,
        position: args.position,
        withoutEnlargement: false,
      });

    if (format === 'jpg') {
      pipeline = pipeline.jpeg({
        quality: args.quality,
        chromaSubsampling: '4:4:4',
        mozjpeg: true,
      });
    } else {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    }

    writes.push(
      pipeline.toFile(outPath).then(async () => {
        const st = await fs.stat(outPath);
        const mb = (st.size / (1024 * 1024)).toFixed(2);
        return { outPath, mb };
      })
    );
  }

  const results = await Promise.all(writes);

  console.log(`Wrote ${results.length} screenshot(s) to ${args.outDir}`);
  for (const r of results) {
    console.log(`- ${r.outPath} (${r.mb} MB)`);
  }

  if (results.length < 4) {
    console.log(
      `\nNote: Google Play requires 4–8 screenshots. Add ${4 - results.length} more input image(s).`
    );
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exitCode = 1;
});
