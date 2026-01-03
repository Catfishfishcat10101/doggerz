/** @format */

/**
 * scripts/find-unused-public-assets.js
 *
 * Heuristic detector for unused files under /public.
 * - Scans public/ for files
 * - Scans src/ + a few public files for string references
 *
 * Notes:
 * - This is best-effort (dynamic URLs, computed paths, and runtime fetches may not be detected).
 * - Treat output as a review list, not an auto-delete list.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_DIR = path.join(ROOT, 'src');

const IGNORE_PUBLIC = new Set(['sw.js', 'manifest.webmanifest', 'favicon.ico']);

function tryReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function collectImplicitPublicReferences() {
  // Some public files are consumed by external platforms (Android App Links),
  // or loaded indirectly via manifests at runtime.
  const refs = [];

  // Android App Links (served from /.well-known/assetlinks.json)
  refs.push('/.well-known/assetlinks.json');

  // Sprite strip URLs referenced indirectly via the JRT manifest.
  const jrtManifestPath = path.join(
    PUBLIC_DIR,
    'sprites',
    'anim',
    'jrt',
    'manifest.json'
  );
  const jrt = tryReadJson(jrtManifestPath);
  const stages = jrt?.stages;
  if (stages && typeof stages === 'object') {
    for (const stage of Object.values(stages)) {
      const base = String(stage?.base || '').replace(/\/+$/g, '');
      const anims = stage?.anims;
      if (!base || !anims || typeof anims !== 'object') continue;
      for (const a of Object.values(anims)) {
        const file = String(a?.file || '').replace(/^\/+/, '');
        if (!file) continue;
        refs.push(`${base}/${file}`);
      }
    }
  }

  return refs;
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, out);
    } else if (e.isFile()) {
      out.push(p);
    }
  }
}

function readAllTextFiles(dir) {
  const files = [];
  walk(dir, files);

  const texts = [];
  for (const f of files) {
    // only scan likely text files
    if (!/\.(js|jsx|ts|tsx|css|html|md|json|cjs)$/i.test(f)) continue;
    try {
      texts.push(fs.readFileSync(f, 'utf8'));
    } catch {
      // ignore
    }
  }
  return texts.join('\n\n');
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.log('[unused-assets] No public/ directory found.');
    return;
  }

  const publicFiles = [];
  walk(PUBLIC_DIR, publicFiles);

  const references =
    readAllTextFiles(SRC_DIR) +
    '\n\n' +
    readAllTextFiles(path.join(ROOT, 'public')) +
    '\n\n' +
    (fs.existsSync(path.join(ROOT, 'index.html'))
      ? fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
      : '') +
    '\n\n' +
    collectImplicitPublicReferences().join('\n');

  const candidates = publicFiles
    .filter((abs) => {
      const rel = path.relative(PUBLIC_DIR, abs).split(path.sep).join('/');
      const base = path.basename(rel);
      if (IGNORE_PUBLIC.has(base)) return false;
      // Files used by external consumers (Android/App Links). Not referenced in app code.
      if (rel.startsWith('.well-known/')) return false;
      // Skip obvious build/dev noise
      if (rel.startsWith('screens/')) return false;
      return true;
    })
    .map((abs) => {
      const rel = path.relative(PUBLIC_DIR, abs).split(path.sep).join('/');
      return { abs, rel, url: `/${rel}` };
    });

  const unused = [];

  for (const c of candidates) {
    const exactHit = references.includes(c.url) || references.includes(c.rel);
    if (exactHit) continue;

    // Heuristics for dynamic path construction patterns.
    // Example: LayeredDogRig builds URLs like `/sprites/rig/${name}` so the full URL
    // might not appear verbatim, but the base folder and the filename do.
    if (c.url.startsWith('/sprites/rig/')) {
      const file = path.basename(c.rel);
      if (references.includes('/sprites/rig/') && references.includes(file))
        continue;
    }

    unused.push(c);
  }

  console.log(`\n[unused-assets] Scanned ${candidates.length} public files.`);
  if (!unused.length) {
    console.log('[unused-assets] No obvious unused assets found.');
    return;
  }

  console.log(`[unused-assets] Potentially unused (${unused.length}):`);
  for (const u of unused) {
    console.log(`- ${u.url}`);
  }

  console.log('\nNotes:');
  console.log('- False positives are expected for dynamically computed paths.');
  console.log('- Review before deleting.');
}

main();
