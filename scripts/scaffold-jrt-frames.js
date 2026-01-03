/**
 * eslint-disable no-console
 * @format
 */

// scripts/scaffold-jrt-frames.js
// Creates empty animation folders (and _meta.json) for the REAL-frame pipeline.
//
// Output:
//   art/frames/jrt/<stage>/<anim>/.gitkeep
//   art/frames/jrt/<stage>/<anim>/_meta.json

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

const DEFAULT_FRAMES_ROOT = path.join(ROOT, 'art', 'frames', 'jrt');
const FRAMES_ROOT = process.env.SPRITES_FRAMES_ROOT
  ? path.resolve(ROOT, process.env.SPRITES_FRAMES_ROOT)
  : DEFAULT_FRAMES_ROOT;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileIfMissing(p, content) {
  if (fs.existsSync(p)) return false;
  fs.writeFileSync(p, content);
  return true;
}

function loadSpec() {
  const raw = fs.readFileSync(SPEC_PATH, 'utf8');
  return JSON.parse(raw);
}

function unique(arr) {
  return Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));
}

function allAnims(spec) {
  const groups = spec?.groups || {};
  const lists = Object.values(groups)
    .map((g) => (Array.isArray(g?.anims) ? g.anims : []))
    .flat();
  return unique(lists);
}

function metaForAnim(spec, anim) {
  const frameSize = Number(spec?.frameSize) || 1024;
  const fps = Number(spec?.defaults?.fps?.[anim]) || 10;
  const suggestedFrames = Number(spec?.defaults?.suggestedFrames?.[anim]) || 8;
  return { fps, frameSize, suggestedFrames };
}

function main() {
  if (!fs.existsSync(SPEC_PATH)) {
    console.error(`[sprites] Missing spec: ${path.relative(ROOT, SPEC_PATH)}`);
    process.exitCode = 1;
    return;
  }

  const spec = loadSpec();
  const stages = Array.isArray(spec?.stages)
    ? spec.stages
    : ['PUPPY', 'ADULT', 'SENIOR'];
  const anims = allAnims(spec);

  if (!anims.length) {
    console.error('[sprites] Spec contains no animations.');
    process.exitCode = 1;
    return;
  }

  ensureDir(FRAMES_ROOT);

  let created = 0;
  for (const stageKey of stages) {
    const stage = String(stageKey).toLowerCase();
    for (const anim of anims) {
      const animDir = path.join(FRAMES_ROOT, stage, anim);
      ensureDir(animDir);

      const gitkeep = path.join(animDir, '.gitkeep');
      const metaPath = path.join(animDir, '_meta.json');

      const meta = metaForAnim(spec, anim);

      if (writeFileIfMissing(gitkeep, '')) created += 1;
      if (writeFileIfMissing(metaPath, JSON.stringify(meta, null, 2) + '\n')) {
        created += 1;
      }
    }
  }

  console.log(
    `[sprites] Scaffolded folders under ${path.relative(
      ROOT,
      FRAMES_ROOT
    )} (created ${created} file(s)).`
  );
  console.log(
    '[sprites] Next: add real frames named frame_0001.webp, frame_0002.webp, ...'
  );
}

main();
