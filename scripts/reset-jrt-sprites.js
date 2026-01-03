/**
 * eslint-disable no-console
 * @format
 */

// scripts/reset-jrt-sprites.js
// Deletes (only) dog sprite assets so they can be regenerated cleanly.
// This does NOT delete app icons/backgrounds/etc.

const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..');

function rmSafe(p, opts = {}) {
  try {
    fs.rmSync(p, { force: true, recursive: true, ...opts });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const targets = [
    // Animated strips + manifest
    path.join(ROOT, 'public', 'sprites', 'anim', 'jrt'),

    // Static stage fallbacks
    path.join(ROOT, 'public', 'sprites', 'jrt_puppy.webp'),
    path.join(ROOT, 'public', 'sprites', 'jrt_adult.webp'),
    path.join(ROOT, 'public', 'sprites', 'jrt_senior.webp'),

    // Base stage sources used by scripts
    path.join(ROOT, 'public', 'sprites', 'jack_russell_puppy.webp'),
    path.join(ROOT, 'public', 'sprites', 'jack_russell_adult.webp'),
    path.join(ROOT, 'public', 'sprites', 'jack_russell_senior.webp'),

    // Any generated per-frame art
    path.join(ROOT, 'art', 'frames', 'jrt'),
  ];

  console.log('[Doggerz] Resetting dog sprite assets...');
  for (const t of targets) {
    const ok = rmSafe(t);
    console.log(`  ${ok ? 'removed' : 'skip'}: ${path.relative(ROOT, t)}`);
  }
  console.log('[Doggerz] Reset complete.');
}

main();
