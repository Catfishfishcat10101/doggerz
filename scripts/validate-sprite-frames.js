/**
 * eslint-disable no-console
 * @format
 */

// scripts/validate-sprite-frames.js
// Validate that real sprite frame folders exist and contain usable frames.
//
// Usage:
//   node scripts/validate-sprite-frames.js

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_FRAMES_ROOT = path.join(ROOT, 'art', 'frames', 'jrt');
const LEGACY_FRAMES_ROOT = path.join(
  ROOT,
  'public',
  'sprites',
  'frames',
  'jrt'
);
const FRAMES_ROOT = process.env.SPRITES_FRAMES_ROOT
  ? path.resolve(ROOT, process.env.SPRITES_FRAMES_ROOT)
  : DEFAULT_FRAMES_ROOT;
const SPEC_PATH = path.join(
  ROOT,
  'src',
  'features',
  'game',
  'sprites',
  'jrtAnimSpec.json'
);

function readJsonIfExists(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function unique(arr) {
  return Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));
}

function requiredCoreAnimsFromSpec(spec) {
  const core = Array.isArray(spec?.groups?.core?.anims)
    ? spec.groups.core.anims
    : [];
  return unique(core);
}

function listDirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function isImageFile(name) {
  const ext = path.extname(name).toLowerCase();
  return ext === '.png' || ext === '.webp';
}

function listFrameFiles(animDirAbs) {
  if (!fs.existsSync(animDirAbs)) return [];
  return fs
    .readdirSync(animDirAbs)
    .filter((n) => isImageFile(n))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    )
    .map((n) => path.join(animDirAbs, n));
}

async function main() {
  console.log('[sprites] Validating JRT real-frame folders...');

  const strict = process.argv.includes('--strict');
  const spec = readJsonIfExists(SPEC_PATH);
  const requiredCore = requiredCoreAnimsFromSpec(spec);

  const framesRoot = fs.existsSync(FRAMES_ROOT)
    ? FRAMES_ROOT
    : fs.existsSync(LEGACY_FRAMES_ROOT)
    ? LEGACY_FRAMES_ROOT
    : null;

  if (!framesRoot) {
    console.error(
      `[sprites] Missing frames root. Looked for:\n` +
        `- ${path.relative(ROOT, FRAMES_ROOT)}\n` +
        `- ${path.relative(ROOT, LEGACY_FRAMES_ROOT)}\n` +
        `Set SPRITES_FRAMES_ROOT to override.`
    );
    process.exitCode = 1;
    return;
  }

  const stages = listDirs(framesRoot);
  if (!stages.length) {
    console.error(
      '[sprites] No stages found. Expected puppy/adult/senior folders.'
    );
    process.exitCode = 1;
    return;
  }

  let problems = 0;

  for (const stage of stages) {
    const stageDir = path.join(framesRoot, stage);
    const anims = listDirs(stageDir);
    if (!anims.length) {
      console.warn(`[sprites] ${stage}: no anim folders`);
      problems += 1;
      continue;
    }

    // Check required core anim folder presence (from spec), if spec exists.
    if (requiredCore.length) {
      const missingCoreFolders = requiredCore.filter((a) => !anims.includes(a));
      if (missingCoreFolders.length) {
        const msg = `[sprites] ${stage}: missing core anim folder(s): ${missingCoreFolders.join(
          ', '
        )}`;
        if (strict) {
          console.error(msg);
          problems += missingCoreFolders.length;
        } else {
          console.warn(msg);
          problems += 1;
        }
      }
    }

    for (const anim of anims) {
      const animDir = path.join(stageDir, anim);
      const frames = listFrameFiles(animDir);
      if (!frames.length) {
        console.warn(`[sprites] ${stage}/${anim}: no frame images`);
        problems += 1;
        continue;
      }

      // Inspect first frame for sanity.
      // eslint-disable-next-line no-await-in-loop
      const meta = await sharp(frames[0]).metadata();
      if (!meta.width || !meta.height) {
        console.warn(`[sprites] ${stage}/${anim}: unreadable first frame`);
        problems += 1;
        continue;
      }

      if (frames.length < 2) {
        console.warn(
          `[sprites] ${stage}/${anim}: only 1 frame (will look static)`
        );
      }

      console.log(
        `[sprites] OK ${stage}/${anim}: ${frames.length} frames (first=${meta.width}x${meta.height})`
      );
    }
  }

  if (problems) {
    console.warn(`[sprites] Validation finished with ${problems} warning(s).`);
    if (strict) process.exitCode = 1;
  } else {
    console.log('[sprites] Validation finished clean.');
  }
}

main().catch((err) => {
  console.error('[sprites] Failed:', err);
  process.exitCode = 1;
});
