/** @format */

/**
 * scripts/analyze-bundle.js
 *
 * Runs a Vite production build with a bundle visualizer.
 * Output: dist/stats.html
 *
 * Usage:
 *   node scripts/analyze-bundle.js
 */

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

function main() {
  console.log('[Doggerz] Running bundle analysis build (writes dist/stats.html)…');

  const r = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      ANALYZE: '1',
    },
    shell: false,
  });

  if (r.status !== 0) {
    process.exit(r.status || 1);
  }

  console.log('\n[Doggerz] Bundle report generated: dist/stats.html');
}

main();
