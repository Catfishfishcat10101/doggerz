/** @format */

/**
 * scripts/check-missing-public-assets.js
 *
 * Finds references to "/public" assets (e.g. "/icons/foo.png") in src/ + a few root files
 * and reports which ones do NOT exist on disk.
 *
 * Why this is useful:
 * - catches broken URLs before you ship
 * - complements scripts/find-unused-public-assets.js (which flags the opposite problem)
 *
 * Usage:
 *   node scripts/check-missing-public-assets.js
 */

/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_DIR = path.join(ROOT, 'src');

const EXTRA_SCAN_FILES = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'public', 'sw.js'),
  path.join(ROOT, 'public', 'manifest.webmanifest'),
];

const TEXT_EXT_RE = /\.(js|jsx|ts|tsx|css|html|md|json|cjs|mjs)$/i;

// Asset-like paths we can validate against /public.
//
// Important: avoid false positives inside module/relative imports like:
//   import x from "@/foo/bar.png"   (contains "/foo/bar.png")
//   import x from "../foo/bar.png"  (contains "/foo/bar.png")
// and avoid matching full URLs like https://example.com/a.png.
//
// The negative lookbehind requires the preceding char to NOT be a word char, ':', '@', or '.'
// so we only capture true absolute paths like "/icons/x.png".
const ASSET_PATH_RE =
  /(?<![\w:@.])\/(?<p>[A-Za-z0-9][A-Za-z0-9_\-./]*\.(?:png|jpg|jpeg|webp|svg|gif|ico|mp3|wav|m4a|aac|opus|ogg|flac|json|webmanifest))(?:[?#][^\s'"`)]*)?/g;

const OPTIONAL_ASSETS = new Set([
  // Optional “future drop” backgrounds (code probes for these and falls back gracefully)
  '/backgrounds/backyard-dawn.png',
  '/backgrounds/backyard-dawn.webp',
  '/backgrounds/backyard-dusk.png',
  '/backgrounds/backyard-dusk.webp',
  '/backgrounds/backyard-split.png',
  '/backgrounds/backyard-split.webp',

  // Optional sprite manifest (code tolerates missing and falls back)
  '/sprites/anim/jrt/manifest.json',
]);

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git')
        continue;
      walk(p, out);
    } else if (e.isFile()) {
      out.push(p);
    }
  }
}

function readTextFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function collectSearchText() {
  const files = [];
  walk(SRC_DIR, files);

  const texts = [];
  for (const f of files) {
    if (!TEXT_EXT_RE.test(f)) continue;
    texts.push(readTextFileSafe(f));
  }

  for (const f of EXTRA_SCAN_FILES) {
    if (!fs.existsSync(f)) continue;
    texts.push(readTextFileSafe(f));
  }

  return texts.join('\n\n');
}

function normalizeAssetPath(p) {
  // Ensure it begins with "/" and strip query/hash.
  let out = String(p || '').trim();
  if (!out) return null;
  if (!out.startsWith('/')) out = `/${out}`;
  out = out.split('?')[0].split('#')[0];
  return out;
}

function diskPathForUrl(urlPath) {
  // urlPath like "/icons/doggerz-192.png"
  const cleaned = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;

  // Vite serves /index.html from project root, not /public.
  if (urlPath === '/index.html') return path.join(ROOT, 'index.html');

  return path.join(PUBLIC_DIR, cleaned);
}

function isSkippable(urlPath) {
  // Routes and dev-only special paths
  if (urlPath === '/' || urlPath === '/#' || urlPath.startsWith('/@'))
    return true;
  if (urlPath.startsWith('/src/')) return true;
  if (urlPath.startsWith('/api/')) return true;
  return false;
}

function main() {
  const strict = process.argv.includes('--strict');
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`[assets:missing] public/ not found at: ${PUBLIC_DIR}`);
    process.exit(1);
  }

  const haystack = collectSearchText();
  const found = new Set();

  let m;
  while ((m = ASSET_PATH_RE.exec(haystack))) {
    const p = normalizeAssetPath(m.groups?.p);
    if (!p) continue;
    const urlPath = `/${p.replace(/^\/+/, '')}`;
    if (isSkippable(urlPath)) continue;
    found.add(urlPath);
  }

  const missing = [];
  for (const urlPath of Array.from(found).sort()) {
    if (!strict && OPTIONAL_ASSETS.has(urlPath)) continue;
    const diskPath = diskPathForUrl(urlPath);
    if (!fs.existsSync(diskPath)) {
      missing.push({ urlPath, diskPath });
    }
  }

  console.log(`\n[assets:missing] Scanned references: ${found.size}`);

  if (!missing.length) {
    console.log(
      '[assets:missing] OK: No missing referenced public assets found.'
    );
    return;
  }

  console.error(`\n[assets:missing] FAIL: Missing assets (${missing.length}):`);
  for (const x of missing) {
    console.error(
      `- ${x.urlPath}  (expected on disk: ${path.relative(ROOT, x.diskPath)})`
    );
  }

  console.error('\nNotes:');
  console.error('- This only checks absolute paths like "/icons/foo.png".');
  console.error(
    '- If you build URLs dynamically, this script may miss them (or flag false positives).'
  );

  process.exitCode = 1;
}

main();
