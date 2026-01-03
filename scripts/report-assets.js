/** @format */

/**
 * scripts/report-assets.js
 *
 * Lists the largest assets in your repo so you can target performance wins fast.
 * - scans /public and /src by default
 * - prints largest files (bytes/KB/MB)
 *
 * Usage:
 *   node scripts/report-assets.js
 *   node scripts/report-assets.js --top 40 --minKB 150
 *   node scripts/report-assets.js --dir public --top 25
 *
 * Positional args (nice with npm run):
 *   node scripts/report-assets.js 40 150
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    top: 30,
    minKB: 50,
    dirs: ['public', 'src'],
  };

  // Support positional: <top> <minKB>
  if (argv[0] && /^\d+$/.test(String(argv[0]))) args.top = Number(argv[0]);
  if (argv[1] && /^\d+(\.\d+)?$/.test(String(argv[1])))
    args.minKB = Number(argv[1]);

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--top') args.top = Number(argv[++i] ?? args.top);
    else if (a === '--minKB') args.minKB = Number(argv[++i] ?? args.minKB);
    else if (a === '--dir')
      args.dirs = [String(argv[++i] ?? '')].filter(Boolean);
    else if (a === '--dirs')
      args.dirs = String(argv[++i] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  }

  if (!Number.isFinite(args.top) || args.top <= 0) args.top = 30;
  if (!Number.isFinite(args.minKB) || args.minKB < 0) args.minKB = 50;
  if (!Array.isArray(args.dirs) || args.dirs.length === 0)
    args.dirs = ['public', 'src'];

  return args;
}

function walk(dir, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip common noisy folders
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git')
        continue;
      walk(p, results);
    } else if (e.isFile()) {
      const stat = fs.statSync(p);
      results.push({ path: p, size: stat.size });
    }
  }
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const files = [];
  for (const d of args.dirs) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    walk(abs, files);
  }

  const minBytes = args.minKB * 1024;
  const filtered = files
    .filter((f) => f.size >= minBytes)
    .sort((a, b) => b.size - a.size)
    .slice(0, args.top);

  console.log(
    `\n[Doggerz] Largest assets (>= ${args.minKB} KB), top ${args.top}`
  );
  if (filtered.length === 0) {
    console.log('(none found)');
    return;
  }

  for (const f of filtered) {
    const rel = path.relative(ROOT, f.path).split(path.sep).join('/');
    console.log(`${formatBytes(f.size).padStart(10)}  ${rel}`);
  }

  console.log('\nTips:');
  console.log('- Big PNGs: consider WebP (or resize)');
  console.log('- Big audio: consider AAC/Opus + shorter clips');
  console.log('- Big JS: code-split heavy pages/components');
}

main();
