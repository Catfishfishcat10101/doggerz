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

let FFMPEG_STATIC = null;
try {
  // Optional dependency. If present, provides a platform-specific ffmpeg binary path.
  // eslint-disable-next-line global-require
  FFMPEG_STATIC = require('ffmpeg-static');
} catch {
  FFMPEG_STATIC = null;
}

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

  // Positional (useful via `npm run` where some flags like `--format` are reserved by npm):
  //   node scripts/optimize-audio.js <format> <bitrate> <dir> <out> <minKB>
  // Example:
  //   node scripts/optimize-audio.js aac 64k public/audio public/audio 0
  const pos = Array.isArray(argv) ? argv.slice(0, 5) : [];
  if (
    pos[0] &&
    ['opus', 'aac', 'both'].includes(String(pos[0]).toLowerCase())
  ) {
    args.format = String(pos[0]).toLowerCase();
  }
  if (pos[1] && /^\d+(?:\.\d+)?k$/i.test(String(pos[1]))) {
    args.bitrate = String(pos[1]);
  }
  if (pos[2]) args.dir = String(pos[2]);
  if (pos[3]) args.out = String(pos[3]);
  if (pos[4] && /^\d+(?:\.\d+)?$/.test(String(pos[4]))) {
    args.minKB = Number(pos[4]);
  }

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

function hasFfmpeg(cmd) {
  const r = spawnSync(cmd, ['-version'], {
    stdio: 'ignore',
    shell: false,
  });
  return r.status === 0;
}

function resolveFfmpegCmd() {
  if (hasFfmpeg('ffmpeg')) return 'ffmpeg';
  if (
    typeof FFMPEG_STATIC === 'string' &&
    FFMPEG_STATIC &&
    hasFfmpeg(FFMPEG_STATIC)
  ) {
    return FFMPEG_STATIC;
  }
  return null;
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

  const ffmpegCmd = resolveFfmpegCmd();

  const inDir = path.join(ROOT, args.dir);
  const outDir = path.join(ROOT, args.out);

  if (!fs.existsSync(inDir)) {
    console.error(`[Doggerz] Input dir not found: ${inDir}`);
    process.exit(1);
  }

  if (!ffmpegCmd) {
    console.error('[Doggerz] ffmpeg not found.');
    console.error(
      '- Option A: install ffmpeg (Windows tip: winget install Gyan.FFmpeg)'
    );
    console.error(
      "- Option B: add devDependency 'ffmpeg-static' and re-run (npm i -D ffmpeg-static)"
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
      const r = run(ffmpegCmd, ffArgs, { cwd: ROOT });
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
