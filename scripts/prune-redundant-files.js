/** @format */

// scripts/prune-redundant-files.js
// Removes known redundant/bloat files from the repo workspace.
//
// Usage:
//   node scripts/prune-redundant-files.js --yes
//   node scripts/prune-redundant-files.js        # dry run

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = process.cwd();

const TARGETS = [
  'vite.config.mjs',
  'build-from-art.log',
  'build-sprites.log',
  'tmp-delete-test.txt',
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

async function main() {
  const { yes } = parseArgs(process.argv);
  console.log(`Pruning redundant files (${yes ? 'DELETE' : 'DRY RUN'})...`);

  let planned = 0;
  let deleted = 0;

  for (const rel of TARGETS) {
    const abs = path.join(ROOT, rel);
    if (!(await exists(abs))) continue;

    planned++;
    if (!yes) {
      console.log(` - would delete ${rel}`);
      continue;
    }

    try {
      await fs.unlink(abs);
      deleted++;
      console.log(` - deleted ${rel}`);
    } catch (e) {
      console.warn(` ! failed to delete ${rel}: ${e.message}`);
    }
  }

  if (!yes) {
    console.log(
      `Done. Would delete ${planned} file(s). Run with --yes to apply.`
    );
  } else {
    console.log(`Done. Deleted ${deleted} file(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
