/**
 * eslint-disable no-console
 * @format
 */

// scripts/generate-sprite-asset-checklist.js
// Generates a markdown asset checklist from src/features/game/sprites/jrtAnimSpec.json
//
// Output:
//   docs/sprite-asset-checklist.md

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const SPEC_PATH = path.join(
  ROOT,
  'src',
  'features',
  'game',
  'sprites',
  'jrtAnimSpec.json'
);

const OUT_PATH = path.join(ROOT, 'docs', 'sprite-asset-checklist.md');

function loadSpec() {
  const raw = fs.readFileSync(SPEC_PATH, 'utf8');
  return JSON.parse(raw);
}

function main() {
  const spec = loadSpec();
  const stages = Array.isArray(spec?.stages)
    ? spec.stages
    : ['PUPPY', 'ADULT', 'SENIOR'];
  const groups = spec?.groups || {};

  const lines = [];
  lines.push('# Sprite Asset Checklist (JRT)');
  lines.push('');
  lines.push(
    'This checklist is generated from `src/features/game/sprites/jrtAnimSpec.json`.'
  );
  lines.push('');
  lines.push('Frames go in:');
  lines.push('');
  lines.push('- `art/frames/jrt/<stage>/<anim>/frame_0001.webp`');
  lines.push('');
  lines.push('Build strips + manifest:');
  lines.push('');
  lines.push('- `npm run sprites:jrt:build`');
  lines.push('');

  lines.push('## Stages');
  lines.push('');
  for (const s of stages) {
    lines.push(`- ${String(s).toUpperCase()}`);
  }
  lines.push('');

  const fps = spec?.defaults?.fps || {};
  const suggestedFrames = spec?.defaults?.suggestedFrames || {};

  for (const [groupKey, group] of Object.entries(groups)) {
    const title = String(groupKey).replace(/_/g, ' ');
    lines.push(`## ${title}`);
    lines.push('');
    if (group?.description) lines.push(`_${group.description}_`);
    lines.push('');

    const anims = Array.isArray(group?.anims) ? group.anims : [];
    for (const anim of anims) {
      const a = String(anim);
      const aFps = Number(fps[a]) || 10;
      const aFrames = Number(suggestedFrames[a]) || 8;
      lines.push(`- [ ] \`${a}\` — suggested: ${aFrames} frames @ ${aFps}fps`);
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n', 'utf8');

  console.log(`[sprites] Wrote checklist -> ${path.relative(ROOT, OUT_PATH)}`);
}

main();
