/** @format */

/**
 * scripts/optimize-audio.js
 *
 * Non-destructively generates smaller audio files using ffmpeg.
 * Writes outputs to a separate folder so you can A/B test before swapping URLs.
 *
 * Requirements:
 * - ffmpeg must be installed and available on PATH.
 *
 * Usage:
 *   node scripts/optimize-audio.js
 *   node scripts/optimize-audio.js --dir public/audio --out public/optimized-audio
 *   node scripts/optimize-audio.js --format opus
 *   node scripts/optimize-audio.js --format aac
 *   node scripts/optimize-audio.js --format both --bitrate 64k --minKB 20
 *   node scripts/optimize-audio.js --dryRun
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    dir: 'public/audio',
    out: 'public/optimized-audio',
    format: 'both', // 'opus' | 'aac' | 'both'
    bitrate: '64k',
    minKB: 20,
    mono: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dir') args.dir = String(argv[++i] ?? args.dir);
    else if (a === '--out') args.out = String(argv[++i] ?? args.out);
    else if (a === '--format') args.format = String(argv[++i] ?? args.format);
    else if (a === '--bitrate')
      args.bitrate = String(argv[++i] ?? args.bitrate);
    else if (a === '--minKB') args.minKB = Number(argv[++i] ?? args.minKB);
    else if (a === '--mono') args.mono = true;
    else if (a === '--dryRun') args.dryRun = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }

  args.format = String(args.format || '').toLowerCase();
  if (!['opus', 'aac', 'both'].includes(args.format)) args.format = 'both';
  if (!Number.isFinite(args.minKB) || args.minKB < 0) args.minKB = 20;

  return args;
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
}

function hasFfmpeg() {
  const r = spawnSync('ffmpeg', ['-version'], {
    stdio: 'ignore',
    shell: false,
  });
  return r.status === 0;
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
    `\nDoggerz audio optimizer\n\n` +
      `Generates smaller audio files into a separate folder (non-destructive).\n\n` +
      `Options:\n` +
      `  --dir <path>       Input directory (default: public/audio)\n` +
      `  --out <path>       Output directory (default: public/optimized-audio)\n` +
      `  --format <opus|aac|both>   (default: both)\n` +
      `  --bitrate <e.g. 64k>      (default: 64k)\n` +
      `  --minKB <n>        Only process files >= n KB (default: 20)\n` +
      `  --mono             Downmix to mono\n` +
      `  --dryRun           Print what would happen without running ffmpeg\n` +
      `  --help             Show this help\n`
  );
}

function targetPaths({ src, inDir, outDir, format }) {
  const rel = path.relative(inDir, src);
  const base = rel.replace(/\.[^.]+$/, '');

  const out = [];
  if (format === 'opus' || format === 'both') {
    out.push({
      dst: path.join(outDir, `${base}.opus`),
      kind: 'opus',
    });
  }
  if (format === 'aac' || format === 'both') {
    out.push({
      dst: path.join(outDir, `${base}.m4a`),
      kind: 'aac',
    });
  }
  return out;
}

function buildFfmpegArgs({ src, dst, kind, bitrate, mono }) {
  const args = ['-y', '-i', src, '-vn', '-map_metadata', '-1'];

  if (mono) args.push('-ac', '1');

  if (kind === 'opus') {
    // Great for web + small SFX. Note: iOS Safari support varies.
    args.push('-c:a', 'libopus', '-b:a', bitrate);
  } else if (kind === 'aac') {
    // Very compatible (Apple platforms). Uses native AAC encoder.
    args.push('-c:a', 'aac', '-b:a', bitrate);
  }

  args.push(dst);
  return args;
}

function main() {
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

  if (!hasFfmpeg()) {
    console.error(
      '[Doggerz] ffmpeg not found on PATH. Install ffmpeg, then re-run this script.'
    );
    console.error(
      'Windows tip: install via winget (FFmpeg) or download from ffmpeg.org'
    );
    process.exit(1);
  }

  const files = [];
  walk(inDir, files);

  const minBytes = args.minKB * 1024;
  const audioExts = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']);

  const candidates = files
    .filter((p) => audioExts.has(path.extname(p).toLowerCase()))
    .filter((p) => fs.statSync(p).size >= minBytes);

  if (candidates.length === 0) {
    console.log('[Doggerz] No audio files matched (try lowering --minKB).');
    return;
  }

  ensureDir(outDir);

  console.log(
    `[Doggerz] Optimizing ${candidates.length} audio file(s) -> ${args.out}`
  );
  console.log(
    `[Doggerz] format=${args.format} bitrate=${args.bitrate} mono=${
      args.mono ? 'yes' : 'no'
    } dryRun=${args.dryRun ? 'yes' : 'no'}`
  );

  let totalBefore = 0;
  let totalAfter = 0;

  for (const src of candidates) {
    const before = fs.statSync(src).size;
    totalBefore += before;

    const targets = targetPaths({ src, inDir, outDir, format: args.format });

    for (const t of targets) {
      ensureDir(path.dirname(t.dst));
      const ffArgs = buildFfmpegArgs({
        src,
        dst: t.dst,
        kind: t.kind,
        bitrate: args.bitrate,
        mono: args.mono,
      });

      const relSrc = path.relative(ROOT, src).split(path.sep).join('/');
      const relDst = path.relative(ROOT, t.dst).split(path.sep).join('/');

      if (args.dryRun) {
        console.log(`[dryRun] ${relSrc} -> ${relDst} (${t.kind})`);
        continue;
      }

      console.log(`\n[ffmpeg] ${relSrc} -> ${relDst} (${t.kind})`);
      const r = run('ffmpeg', ffArgs, { cwd: ROOT });
      if (r.status !== 0) {
        console.error(`[Doggerz] ffmpeg failed for: ${relSrc}`);
        process.exit(1);
      }

      const after = fs.statSync(t.dst).size;
      totalAfter += after;
      const saved = before - after;
      const pct = before ? ((saved / before) * 100).toFixed(1) : '0.0';
      console.log(
        `[Doggerz] Result: ${fmt(before)} -> ${fmt(after)} (saved ${fmt(
          saved
        )} / ${pct}%)`
      );
    }
  }

  if (!args.dryRun) {
    console.log(`\n[Doggerz] Total input size:  ${fmt(totalBefore)}`);
    console.log(`[Doggerz] Total output size: ${fmt(totalAfter)}`);
    console.log(
      `[Doggerz] Total saved:       ${fmt(totalBefore - totalAfter)}`
    );
    console.log(
      '\nNext: swap one sound effect at a time in code to verify browser support.'
    );
  }
}

main();
