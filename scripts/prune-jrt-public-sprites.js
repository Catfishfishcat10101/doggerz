/** @format */

// scripts/prune-jrt-public-sprites.js
// Prune unused JRT sprite-strip animations from /public to reduce deploy size.
//
// Why this exists:
// - Vite copies everything in /public into /dist.
// - The generated JRT pack can easily balloon to 100+ large .webp files.
// - The game currently only needs a subset (driven by YardDogActor + training).
//
// Usage:
//   node scripts/prune-jrt-public-sprites.js            # dry run (prints what would be deleted)
//   node scripts/prune-jrt-public-sprites.js --yes     # actually delete files + trim manifest.json

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = process.cwd();

// Keep-list based on current runtime usage:
// - YardDogActor maps intent/commandId -> these animation IDs.
// - Missing animations gracefully fall back to idle, but we keep the ones that are used today.
const KEEP_ANIMS = new Set([
  'idle',
  'walk',
  'run',
  'sit',
  'lay',
  'sleep',
  'eat',
  'drink',
  'bark',
  'howl',
  'poop',
  'pee',
  'shake',
  'scratch',
  'sniff',
  'wag',
  // training commands
  'roll',
  'stay',
]);

const STAGES = [
  { key: 'PUPPY', dir: 'puppy' },
  { key: 'ADULT', dir: 'adult' },
  { key: 'SENIOR', dir: 'senior' },
];

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    yes: args.has('--yes') || args.has('-y'),
    quiet: args.has('--quiet') || args.has('-q'),
  };
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function isWebpAnimFile(fileName) {
  if (!fileName.toLowerCase().endsWith('.webp')) return false;
  // skip hidden or temp files
  if (fileName.startsWith('.')) return false;
  return true;
}

function animIdFromFile(fileName) {
  return fileName.replace(/\.webp$/i, '');
}

async function pruneStage({ stageKey, stageDir, yes, quiet }) {
  const dirPath = path.join(ROOT, 'public', 'sprites', 'anim', 'jrt', stageDir);

  if (!(await exists(dirPath))) {
    if (!quiet) console.log(`[skip] missing dir: ${dirPath}`);
    return { deleted: 0, kept: 0, missingDir: true };
  }

  const files = await fs.readdir(dirPath);
  const webps = files.filter(isWebpAnimFile);

  const toDelete = [];
  let kept = 0;

  for (const f of webps) {
    const animId = animIdFromFile(f);
    if (KEEP_ANIMS.has(animId)) {
      kept++;
    } else {
      toDelete.push(path.join(dirPath, f));
    }
  }

  if (!quiet) {
    console.log(`\n[${stageKey}] ${dirPath}`);
    console.log(`  keep:   ${kept}`);
    console.log(`  delete: ${toDelete.length}`);
    if (!yes) {
      for (const p of toDelete) console.log(`   - ${path.relative(ROOT, p)}`);
    }
  }

  if (!yes) return { deleted: 0, kept, plannedDelete: toDelete.length };

  let deleted = 0;
  for (const p of toDelete) {
    try {
      await fs.unlink(p);
      deleted++;
    } catch (e) {
      // keep going; print warning
      if (!quiet) console.warn(`   ! failed to delete ${path.relative(ROOT, p)}: ${e.message}`);
    }
  }

  return { deleted, kept };
}

async function trimManifest({ yes, quiet }) {
  const manifestPath = path.join(ROOT, 'public', 'sprites', 'anim', 'jrt', 'manifest.json');
  if (!(await exists(manifestPath))) {
    if (!quiet) console.log(`\n[skip] manifest not found: ${path.relative(ROOT, manifestPath)}`);
    return { updated: false };
  }

  const raw = await fs.readFile(manifestPath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    throw new Error(`manifest.json is not valid JSON: ${e.message}`);
  }

  if (!json?.stages) {
    if (!quiet) console.log(`\n[skip] manifest has no stages: ${path.relative(ROOT, manifestPath)}`);
    return { updated: false };
  }

  let changed = false;
  for (const { key } of STAGES) {
    const stage = json.stages[key];
    if (!stage?.anims) continue;

    const beforeKeys = Object.keys(stage.anims);
    for (const animKey of beforeKeys) {
      if (!KEEP_ANIMS.has(animKey)) {
        delete stage.anims[animKey];
        changed = true;
      }
    }
  }

  if (!changed) {
    if (!quiet) console.log(`\n[ok] manifest already trimmed (${path.relative(ROOT, manifestPath)})`);
    return { updated: false };
  }

  if (!yes) {
    if (!quiet) console.log(`\n[dry] would update ${path.relative(ROOT, manifestPath)} (remove non-kept anims)`);
    return { updated: false, dryRun: true };
  }

  // Update metadata (helpful for debugging)
  json.generatedAt = new Date().toISOString();

  await fs.writeFile(manifestPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  if (!quiet) console.log(`\n[write] updated ${path.relative(ROOT, manifestPath)}`);

  return { updated: true };
}

async function main() {
  const { yes, quiet } = parseArgs(process.argv);

  if (!quiet) {
    console.log('Pruning JRT public sprites...');
    console.log(`Mode: ${yes ? 'DELETE' : 'DRY RUN'}`);
    console.log(`Keeping anims: ${Array.from(KEEP_ANIMS).sort().join(', ')}`);
  }

  const results = [];
  for (const s of STAGES) {
    results.push(
      await pruneStage({ stageKey: s.key, stageDir: s.dir, yes, quiet }),
    );
  }

  await trimManifest({ yes, quiet });

  if (!quiet) {
    const deleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
    const planned = results.reduce((sum, r) => sum + (r.plannedDelete || 0), 0);

    console.log(`\nDone.`);
    if (yes) {
      console.log(`Deleted ${deleted} files.`);
    } else {
      console.log(`Would delete ${planned} files (run with --yes to apply).`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
