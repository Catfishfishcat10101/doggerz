/** @format */

// scripts/prune-public-binaries.js
// Removes specific redundant binary assets from /public to reduce deploy size.
//
// Usage:
//   node scripts/prune-public-binaries.js --yes
//   node scripts/prune-public-binaries.js        # dry run

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = process.cwd();

const CONDITIONAL_PAIRS = [
  {
    delete: 'public/backgrounds/backyard-day.png',
    keepIfExists: 'public/backgrounds/backyard-day.webp',
  },
  {
    delete: 'public/backgrounds/backyard-night.png',
    keepIfExists: 'public/backgrounds/backyard-night.webp',
  },
  {
    // After generating /audio/bark.m4a, the older mp3 becomes redundant for deploy size.
    // We only delete if the m4a exists (and is smaller/equal), so this is safe.
    delete: 'public/audio/bark.mp3',
    keepIfExists: 'public/audio/bark.m4a',
    requireKeepSmallerOrEqual: true,
  },
];

const TARGETS = [
  // Safe to remove once the repo is using the generated sprite pack.
  'public/sprites/anim/jrt/.gitkeep',

  // Cleanup: outputs created by audio optimization experiments.
  'public/optimized-audio/bark.opus',
  'public/optimized-audio/bark.m4a',
];

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return { yes: args.has('--yes') || args.has('-y') };
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function sizeOf(p) {
  try {
    const st = await fs.stat(p);
    return Number(st.size) || 0;
  } catch {
    return 0;
  }
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

async function main() {
  const { yes } = parseArgs(process.argv);
  console.log(`Pruning public binaries (${yes ? 'DELETE' : 'DRY RUN'})...`);

  let planned = 0;
  let deleted = 0;
  let bytesPlanned = 0;
  let bytesDeleted = 0;

  for (const pair of CONDITIONAL_PAIRS) {
    const delAbs = path.join(ROOT, pair.delete);
    const keepAbs = path.join(ROOT, pair.keepIfExists);

    if (!(await exists(delAbs))) continue;
    if (!(await exists(keepAbs))) {
      console.log(
        ` - skip ${pair.delete} (missing required keep file: ${pair.keepIfExists})`
      );
      continue;
    }

    if (pair.requireKeepSmallerOrEqual) {
      const delBytes = await sizeOf(delAbs);
      const keepBytes = await sizeOf(keepAbs);
      if (keepBytes <= 0) {
        console.log(
          ` - skip ${pair.delete} (keep file unreadable: ${pair.keepIfExists})`
        );
        continue;
      }
      if (keepBytes > delBytes) {
        console.log(
          ` - skip ${pair.delete} (keep file is larger: ${
            pair.keepIfExists
          } ${fmt(keepBytes)} > ${fmt(delBytes)})`
        );
        continue;
      }
    }

    const bytes = await sizeOf(delAbs);
    planned += 1;
    bytesPlanned += bytes;

    if (!yes) {
      console.log(` - would delete ${pair.delete} (${fmt(bytes)})`);
      continue;
    }

    try {
      await fs.unlink(delAbs);
      deleted += 1;
      bytesDeleted += bytes;
      console.log(` - deleted ${pair.delete} (${fmt(bytes)})`);
    } catch (e) {
      console.warn(` ! failed to delete ${pair.delete}: ${e.message}`);
    }
  }

  for (const rel of TARGETS) {
    const abs = path.join(ROOT, rel);
    if (!(await exists(abs))) continue;

    const bytes = await sizeOf(abs);
    planned += 1;
    bytesPlanned += bytes;

    if (!yes) {
      console.log(` - would delete ${rel} (${fmt(bytes)})`);
      continue;
    }

    try {
      await fs.unlink(abs);
      deleted += 1;
      bytesDeleted += bytes;
      console.log(` - deleted ${rel} (${fmt(bytes)})`);
    } catch (e) {
      console.warn(` ! failed to delete ${rel}: ${e.message}`);
    }
  }

  if (!yes) {
    console.log(
      `Done. Would delete ${planned} file(s) totaling ~${fmt(
        bytesPlanned
      )}. Run with --yes to apply.`
    );
  } else {
    console.log(
      `Done. Deleted ${deleted} file(s) totaling ~${fmt(bytesDeleted)}.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
