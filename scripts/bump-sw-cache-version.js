/** @format */

/**
 * scripts/bump-sw-cache-version.js
 *
 * Bumps the CACHE_VERSION in public/sw.js so PWA installs pick up new cached assets.
 *
 * Usage:
 *   node scripts/bump-sw-cache-version.js
 *   node scripts/bump-sw-cache-version.js --set doggerz-v10
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SW_PATH = path.join(ROOT, 'public', 'sw.js');

function parseArgs(argv) {
  const args = { set: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--set') args.set = String(argv[++i] ?? '').trim() || null;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(SW_PATH)) {
    console.error(`[Doggerz] Missing service worker: ${SW_PATH}`);
    process.exit(1);
  }

  const text = fs.readFileSync(SW_PATH, 'utf8');

  const re = /const\s+CACHE_VERSION\s*=\s*(['"])(?<v>doggerz-v(?<n>\d+))\1\s*;/;
  const m = text.match(re);

  if (!m?.groups?.v || !m.groups?.n) {
    console.error(
      '[Doggerz] Could not find CACHE_VERSION like doggerz-vN in public/sw.js'
    );
    process.exit(1);
  }

  const current = m.groups.v;
  const currentN = Number(m.groups.n);

  let next = args.set;
  if (next) {
    if (!/^doggerz-v\d+$/.test(next)) {
      console.error(
        `[Doggerz] Invalid --set value: ${next} (expected doggerz-vN)`
      );
      process.exit(1);
    }
  } else {
    next = `doggerz-v${currentN + 1}`;
  }

  if (next === current) {
    console.log(`[Doggerz] CACHE_VERSION already ${current} (no change)`);
    return;
  }

  const updated = text.replace(re, (full, quote) => {
    return `const CACHE_VERSION = ${quote}${next}${quote};`;
  });

  fs.writeFileSync(SW_PATH, updated, 'utf8');
  console.log(`[Doggerz] Updated CACHE_VERSION: ${current} -> ${next}`);
}

main();
