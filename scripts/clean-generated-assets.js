/** @format */

/**
 * scripts/clean-generated-assets.js
 *
 * Deletes common generated/temporary asset folders produced by scripts.
 * Helpful before commits, or when you want to "reset" optimization outputs.
 *
 * Default targets (if they exist):
 * - public/optimized
 * - public/optimized-audio
 * - public/optimized-sprites
 *
 * Usage:
 *   node scripts/clean-generated-assets.js
 *   node scripts/clean-generated-assets.js --dryRun
 */

/* eslint-disable no-console */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { dryRun: false };
  for (const a of argv) {
    if (a === '--dryRun') args.dryRun = true;
    if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function usage() {
  console.log(
    `\nDoggerz clean generated assets\n\n` +
      `Deletes output folders produced by optimizer scripts.\n\n` +
      `Options:\n` +
      `  --dryRun    Print what would be deleted\n` +
      `  --help      Show help\n`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const targets = [
    path.join(ROOT, 'public', 'optimized'),
    path.join(ROOT, 'public', 'optimized-audio'),
    path.join(ROOT, 'public', 'optimized-sprites'),
  ];

  const existing = targets.filter((p) => fs.existsSync(p));

  if (!existing.length) {
    console.log('[clean] Nothing to delete (no generated folders found).');
    return;
  }

  console.log(`[clean] Found ${existing.length} generated folder(s):`);
  for (const p of existing) {
    console.log(`- ${path.relative(ROOT, p)}`);
  }

  if (args.dryRun) {
    console.log('\n[clean] dryRun enabled: no changes made.');
    return;
  }

  for (const p of existing) {
    rmrf(p);
  }

  console.log('\n[clean] Done.');
}

main();
