/** @format */

/**
 * scripts/preflight.js
 *
 * A lightweight “are we shippable?” checker.
 * - Verifies key PWA files exist
 * - Ensures manifest icons exist on disk
 * - Ensures service worker CORE_ASSETS entries exist on disk
 *
 * Usage:
 *   node scripts/preflight.js
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ROOT_INDEX_HTML = path.join(ROOT, 'index.html');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function existsRelativeToPublic(urlPath) {
  // urlPath like '/icons/doggerz-192.png'
  const cleaned = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  const diskPath = path.join(PUBLIC_DIR, cleaned);
  return { diskPath, exists: fs.existsSync(diskPath) };
}

function existsRelativeToRoot(urlPath) {
  const cleaned = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  const diskPath = path.join(ROOT, cleaned);
  return { diskPath, exists: fs.existsSync(diskPath) };
}

function extractCoreAssetsFromServiceWorker(swText) {
  // Very small parser for: const CORE_ASSETS = [ '...', "...", ... ];
  const match = swText.match(
    /const\s+CORE_ASSETS\s*=\s*\[(?<body>[\s\S]*?)\];/m
  );
  if (!match || !match.groups || !match.groups.body) return [];

  const body = match.groups.body;
  const results = [];

  // Capture both '...' and "..." entries
  const re = /['"](?<p>\/[^'"\n]+)['"]/g;
  let m;
  while ((m = re.exec(body))) {
    if (m.groups?.p) results.push(m.groups.p);
  }
  return results;
}

function fail(message) {
  console.error(`\n[Doggerz preflight] FAIL: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`[Doggerz preflight] WARN: ${message}`);
}

function ok(message) {
  console.log(`[Doggerz preflight] OK: ${message}`);
}

function main() {
  process.exitCode = 0;

  const manifestPath = path.join(PUBLIC_DIR, 'manifest.webmanifest');
  const swPath = path.join(PUBLIC_DIR, 'sw.js');

  if (!fs.existsSync(PUBLIC_DIR)) fail(`Missing public dir: ${PUBLIC_DIR}`);
  if (!fs.existsSync(manifestPath)) fail(`Missing manifest: ${manifestPath}`);
  else ok('manifest.webmanifest present');

  if (!fs.existsSync(swPath)) fail(`Missing service worker: ${swPath}`);
  else ok('sw.js present');

  if (process.exitCode) return;

  // Manifest icons
  const manifest = readJson(manifestPath);
  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];

  if (icons.length === 0) {
    warn('Manifest has no icons array');
  } else {
    for (const icon of icons) {
      if (!icon?.src) continue;
      const { diskPath, exists } = existsRelativeToPublic(icon.src);
      if (!exists)
        fail(`Manifest icon missing on disk: ${icon.src} -> ${diskPath}`);
    }
    if (!process.exitCode) ok(`Manifest icons exist (${icons.length})`);
  }

  // Service worker CORE_ASSETS
  const swText = fs.readFileSync(swPath, 'utf8');
  const coreAssets = extractCoreAssetsFromServiceWorker(swText);

  if (coreAssets.length === 0) {
    warn('Could not find CORE_ASSETS array in sw.js (or it is empty)');
  } else {
    let missingCount = 0;
    for (const asset of coreAssets) {
      // ignore entries that are not file paths we can check (only same-origin absolute)
      if (!asset.startsWith('/')) continue;

      // Vite serves index.html from project root (not /public)
      if (asset === '/index.html') {
        if (!fs.existsSync(ROOT_INDEX_HTML)) {
          missingCount += 1;
          fail(
            `SW CORE_ASSETS missing on disk: ${asset} -> ${ROOT_INDEX_HTML}`
          );
        }
        continue;
      }

      // '/' is a route, not a file on disk
      if (asset === '/') continue;

      const { diskPath, exists } = existsRelativeToPublic(asset);
      if (!exists) {
        missingCount += 1;
        fail(`SW CORE_ASSETS missing on disk: ${asset} -> ${diskPath}`);
      }
    }

    if (missingCount === 0) ok(`SW CORE_ASSETS exist (${coreAssets.length})`);
  }

  if (!process.exitCode) {
    console.log('\n[Doggerz preflight] All checks passed.');
  }
}

main();
