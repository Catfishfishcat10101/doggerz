/**
 * eslint-disable no-console
 * @format
 */

// scripts/generate-mock-jrt-frames.js
// Create placeholder per-frame images under art/frames/jrt/...
// so the "REAL frames -> strip" pipeline can be exercised end-to-end.
//
// This does NOT create real animation art — it simply wobbles the existing
// stage sprite a tiny bit across frames.
//
// Usage examples:
//   node scripts/generate-mock-jrt-frames.js --stage puppy --anim idle --frames 8
//   node scripts/generate-mock-jrt-frames.js --stage adult --anim walk --frames 12 --force
//
// Notes:
// - Outputs: art/frames/jrt/<stage>/<anim>/frame_0001.webp ...
// - Will not overwrite existing frames unless --force.

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

const SPRITES_ROOT = path.join(ROOT, 'public', 'sprites');
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

const DEFAULT_STAGES = ['puppy', 'adult', 'senior'];
const DEFAULT_GROUP = 'core';

// Keep the composited sprite smaller than the output canvas so translate offsets
// never break sharp's composite dimension constraints.
const DEFAULT_MARGIN = 96;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pad4(n) {
  return String(n).padStart(4, '0');
}

function parseArgs(argv) {
  const out = {
    stages: [],
    anim: null,
    anims: [],
    group: null,
    frames: null,
    size: 1024,
    amplitude: 14,
    rotate: 1.5,
    margin: DEFAULT_MARGIN,
    force: false,
    fps: null,
  };

  // Positional fallback (useful when npm interprets unknown --flags):
  //   <stage> <anim> <frames>
  // Example:
  //   npm run sprites:jrt:mock-frames -- puppy idle 8
  // IMPORTANT: only do this when the user didn't pass any --flags at all,
  // otherwise we'd accidentally treat flag values (e.g. "--group core") as stages.
  const hasFlags = argv.some(
    (x) => typeof x === 'string' && x.startsWith('--')
  );
  if (!hasFlags) {
    const positional = argv.filter(
      (x) => typeof x === 'string' && !x.startsWith('-')
    );
    if (positional.length >= 1) out.stages.push(positional[0]);
    if (positional.length >= 2) out.anim = positional[1];
    if (positional.length >= 3) {
      const v = Number(positional[2]);
      if (Number.isFinite(v) && v > 0) out.frames = Math.floor(v);
    }
  }

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];

    if (a === '--stage' || a === '--stages') {
      const v = argv[i + 1];
      if (v) out.stages.push(v);
      i += 1;
      continue;
    }

    if (a === '--anims') {
      const v = argv[i + 1];
      if (v) out.anims.push(...String(v).split(','));
      i += 1;
      continue;
    }

    if (a === '--group') {
      const v = argv[i + 1];
      if (v) out.group = String(v).trim();
      i += 1;
      continue;
    }

    if (a === '--anim') {
      const v = argv[i + 1];
      if (v) out.anim = v;
      i += 1;
      continue;
    }

    if (a === '--frames') {
      const v = Number(argv[i + 1]);
      if (Number.isFinite(v) && v > 0) out.frames = Math.floor(v);
      i += 1;
      continue;
    }

    if (a === '--size') {
      const v = Number(argv[i + 1]);
      if (Number.isFinite(v) && v > 0) out.size = Math.floor(v);
      i += 1;
      continue;
    }

    if (a === '--amplitude') {
      const v = Number(argv[i + 1]);
      if (Number.isFinite(v) && v >= 0) out.amplitude = v;
      i += 1;
      continue;
    }

    if (a === '--rotate') {
      const v = Number(argv[i + 1]);
      if (Number.isFinite(v)) out.rotate = v;
      i += 1;
      continue;
    }

    if (a === '--margin') {
      const v = Number(argv[i + 1]);
      if (Number.isFinite(v) && v >= 0) out.margin = Math.floor(v);
      i += 1;
      continue;
    }

    if (a === '--fps') {
      const v = Number(argv[i + 1]);
      if (Number.isFinite(v) && v > 0) out.fps = v;
      i += 1;
      continue;
    }

    if (a === '--force') {
      out.force = true;
      continue;
    }
  }

  // Default: generate for all common stages.
  if (!out.stages.length) out.stages = DEFAULT_STAGES;

  out.stages = Array.from(
    new Set(out.stages.map((s) => String(s).trim()))
  ).filter(Boolean);

  if (out.anim) out.anims.push(out.anim);
  out.anims = Array.from(
    new Set(out.anims.map((s) => String(s).trim()))
  ).filter(Boolean);

  if (!out.group) out.group = DEFAULT_GROUP;

  return out;
}

function listExistingFrames(animDir) {
  if (!fs.existsSync(animDir)) return [];
  return fs
    .readdirSync(animDir)
    .filter((n) => /^frame_\d{4}\.(webp|png)$/i.test(n));
}

function listDirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function framesRootForFolderDiscovery() {
  // When --group all, we also look at existing scaffolded folders to ensure
  // we cover everything already laid out on disk.
  if (fs.existsSync(FRAMES_ROOT)) return FRAMES_ROOT;
  if (fs.existsSync(LEGACY_FRAMES_ROOT)) return LEGACY_FRAMES_ROOT;
  return FRAMES_ROOT;
}

function stageSpritePath(stage) {
  return path.join(SPRITES_ROOT, `jack_russell_${stage}.webp`);
}

function metaPathFor(animDir) {
  return path.join(animDir, '_meta.json');
}

function readJsonIfExists(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function unique(arr) {
  return Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));
}

function readSpec() {
  return readJsonIfExists(SPEC_PATH);
}

function stagesFromSpec(spec) {
  const raw = Array.isArray(spec?.stages) ? spec.stages : [];
  return unique(raw).map((s) => String(s).toLowerCase());
}

function animsFromGroup(spec, group) {
  if (!spec?.groups) return [];
  if (!group || group === 'core') {
    return Array.isArray(spec.groups.core?.anims) ? spec.groups.core.anims : [];
  }
  if (group === 'all') {
    const out = [];
    for (const g of Object.values(spec.groups)) {
      if (Array.isArray(g?.anims)) out.push(...g.anims);
    }
    return out;
  }
  const g = spec.groups[group];
  return Array.isArray(g?.anims) ? g.anims : [];
}

function defaultsForAnim(spec, anim) {
  const fps = Number(spec?.defaults?.fps?.[anim]);
  const suggestedFrames = Number(spec?.defaults?.suggestedFrames?.[anim]);
  return {
    fps: Number.isFinite(fps) && fps > 0 ? fps : null,
    suggestedFrames:
      Number.isFinite(suggestedFrames) && suggestedFrames > 0
        ? suggestedFrames
        : null,
  };
}

function motionProfile(anim) {
  // Goal: make each animation feel distinct and "alive" even though it is
  // generated procedurally from a single base sprite.
  //
  // Fields:
  // - amp: base translation amplitude (pixels)
  // - rot: base rotation amplitude (degrees)
  // - bobX/bobY: how much horizontal/vertical motion is used
  // - squash: scale wobble amount (0..0.12 typical)
  // - spin: full-spin degrees across one cycle (e.g. 360 for a full roll)
  // - dyMode: vertical motion wave shape
  // - blur: blur radius for high-energy motion
  // - brightness/saturation: subtle color pulses
  // - baseBrightness/baseSaturation: constant bias
  const P = {
    idle: { amp: 10, rot: 0.8, bobX: 0.3, bobY: 1.0, squash: 0.03 },
    walk: { amp: 22, rot: 1.0, bobX: 1.2, bobY: 0.7, squash: 0.02 },
    run: { amp: 30, rot: 1.4, bobX: 1.6, bobY: 0.6, squash: 0.03, blur: 0.2 },
    sit: { amp: 7, rot: 0.5, bobX: 0.2, bobY: 0.5, squash: 0.02 },
    lay: { amp: 6, rot: 0.4, bobX: 0.2, bobY: 0.35, squash: 0.02 },
    sleep: {
      amp: 4,
      rot: 0.2,
      bobX: 0.1,
      bobY: 0.8,
      squash: 0.05,
      dyMode: 'absSin',
      baseBrightness: 0.98,
      baseSaturation: 0.95,
    },
    eat: { amp: 12, rot: 0.8, bobX: 0.4, bobY: 1.0, squash: 0.04 },
    drink: { amp: 10, rot: 0.7, bobX: 0.3, bobY: 0.9, squash: 0.03 },
    bark: {
      amp: 14,
      rot: 1.8,
      bobX: 0.5,
      bobY: 0.4,
      squash: 0.05,
      brightness: 0.05,
    },
    howl: {
      amp: 12,
      rot: 1.2,
      bobX: 0.35,
      bobY: 0.9,
      squash: 0.04,
      dyMode: 'absSin',
    },
    pant: {
      amp: 6,
      rot: 0.3,
      bobX: 0.2,
      bobY: 0.5,
      squash: 0.06,
      dyMode: 'absSin',
    },
    wag: { amp: 16, rot: 0.7, bobX: 1.1, bobY: 0.25, squash: 0.03 },
    sniff: { amp: 12, rot: 1.0, bobX: 0.7, bobY: 0.8, squash: 0.03 },
    yawn: {
      amp: 10,
      rot: 0.6,
      bobX: 0.3,
      bobY: 0.7,
      squash: 0.08,
      dyMode: 'absSin',
    },
    stretch: { amp: 10, rot: 0.8, bobX: 0.4, bobY: 1.0, squash: 0.12 },
    lick: { amp: 10, rot: 0.9, bobX: 0.6, bobY: 0.7, squash: 0.04 },
    shake: { amp: 26, rot: 4.0, bobX: 1.2, bobY: 0.3, squash: 0.02, blur: 1.2 },
    scratch: {
      amp: 20,
      rot: 1.6,
      bobX: 1.0,
      bobY: 0.25,
      squash: 0.02,
      blur: 0.5,
    },
    poop: {
      amp: 8,
      rot: 0.4,
      bobX: 0.2,
      bobY: 0.6,
      squash: 0.03,
      baseBrightness: 0.98,
    },
    pee: { amp: 10, rot: 0.6, bobX: 0.35, bobY: 0.35, squash: 0.02 },
    jump: {
      amp: 24,
      rot: 1.2,
      bobX: 0.5,
      bobY: 1.3,
      squash: 0.05,
      dyMode: 'jumpArc',
    },
    dig: {
      amp: 16,
      rot: 1.1,
      bobX: 0.9,
      bobY: 0.6,
      squash: 0.02,
      dyMode: 'digDown',
    },
    paw: {
      amp: 12,
      rot: 1.0,
      bobX: 0.6,
      bobY: 0.6,
      squash: 0.04,
      dyMode: 'absSin',
    },
    roll: { amp: 10, rot: 0.8, bobX: 0.6, bobY: 0.6, squash: 0.02, spin: 360 },
    spin: {
      amp: 8,
      rot: 0.6,
      bobX: 0.4,
      bobY: 0.4,
      squash: 0.02,
      spin: 540,
      blur: 0.3,
    },
    bow: {
      amp: 12,
      rot: 0.7,
      bobX: 0.3,
      bobY: 1.0,
      squash: 0.08,
      dyMode: 'absSin',
    },
    beg: {
      amp: 14,
      rot: 1.0,
      bobX: 0.3,
      bobY: 1.1,
      squash: 0.06,
      dyMode: 'absSin',
    },
    sit_pretty: {
      amp: 12,
      rot: 0.7,
      bobX: 0.25,
      bobY: 1.0,
      squash: 0.05,
      dyMode: 'absSin',
    },
    play_dead: {
      amp: 10,
      rot: 0.8,
      bobX: 0.3,
      bobY: 0.5,
      squash: 0.03,
      spin: 180,
    },
    fetch: { amp: 22, rot: 1.1, bobX: 1.3, bobY: 0.7, squash: 0.03 },
    stay: { amp: 5, rot: 0.2, bobX: 0.2, bobY: 0.4, squash: 0.02 },
    celebrate: {
      amp: 22,
      rot: 2.2,
      bobX: 0.6,
      bobY: 1.1,
      squash: 0.08,
      brightness: 0.07,
      baseSaturation: 1.08,
      dyMode: 'absSin',
    },
    sad: {
      amp: 7,
      rot: 0.25,
      bobX: 0.2,
      bobY: 0.9,
      squash: 0.02,
      baseBrightness: 0.92,
      baseSaturation: 0.75,
      dyMode: 'absSin',
    },
    surprised: {
      amp: 14,
      rot: 1.4,
      bobX: 0.4,
      bobY: 1.2,
      squash: 0.06,
      baseBrightness: 1.06,
      brightness: 0.05,
      dyMode: 'jumpArc',
    },
  };

  return (
    P[anim] || {
      amp: 12,
      rot: 0.9,
      bobX: 0.5,
      bobY: 0.7,
      squash: 0.03,
    }
  );
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

async function buildInnerSprite({ srcSpritePath, size, margin }) {
  const inner = Math.max(1, size - margin * 2);
  const buf = await sharp(srcSpritePath)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .toBuffer();
  return { buf, inner };
}

async function renderFrame({
  baseInnerBuf,
  innerSize,
  anim,
  size,
  margin,
  i,
  frames,
  amplitude,
  rotate,
}) {
  const t = (i / frames) * Math.PI * 2;
  const prof = motionProfile(anim);

  function wave(mode) {
    if (mode === 'absSin') return Math.abs(Math.sin(t));
    if (mode === 'jumpArc') return -Math.abs(Math.sin(t));
    if (mode === 'digDown') return Math.abs(Math.sin(t));
    return Math.cos(t);
  }

  // keep translation safely within the margin so composite never overflows
  const amp = amplitude != null ? amplitude : prof.amp != null ? prof.amp : 12;
  const maxShift = Math.max(0, margin - 2);
  const dx = clamp(
    Math.round(Math.sin(t) * amp * (prof.bobX ?? 0.5)),
    -maxShift,
    maxShift
  );
  const dy = clamp(
    Math.round(wave(prof.dyMode) * (amp * 0.6) * (prof.bobY ?? 0.7)),
    -maxShift,
    maxShift
  );

  const baseRot = rotate != null ? rotate : prof.rot != null ? prof.rot : 1.0;
  const spin = Number.isFinite(prof.spin) ? prof.spin : 0;
  const rot = Math.sin(t) * baseRot + (spin ? (i / frames) * spin : 0);

  const squash = Number.isFinite(prof.squash) ? prof.squash : 0;
  const squashWave = Math.sin(t);
  const sx = 1 + squashWave * squash;
  const sy = 1 - squashWave * squash;

  const baseBrightness = Number.isFinite(prof.baseBrightness)
    ? prof.baseBrightness
    : 1;
  const baseSaturation = Number.isFinite(prof.baseSaturation)
    ? prof.baseSaturation
    : 1;
  const brightPulse = Number.isFinite(prof.brightness) ? prof.brightness : 0;
  const brightness = baseBrightness + Math.sin(t) * brightPulse;
  const saturation = baseSaturation;

  const blur = Number.isFinite(prof.blur) ? prof.blur : 0;

  // rotated buffer is forced back to innerSize so it's always compositable.
  let img = sharp(baseInnerBuf)
    // squash/stretch first
    .resize(
      Math.max(1, Math.round(innerSize * sx)),
      Math.max(1, Math.round(innerSize * sy)),
      {
        fit: 'fill',
      }
    )
    // then rotate/spin
    .rotate(rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    // clamp back to inner canvas
    .resize(innerSize, innerSize, { fit: 'cover', position: 'center' })
    // subtle color variation
    .modulate({ brightness, saturation });

  // sharp.blur(sigma) requires sigma in [0.3, 1000].
  if (blur >= 0.3) img = img.blur(blur);

  const wobbleBuf = await img.toBuffer();

  const out = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const baseLeft = Math.round((size - innerSize) / 2) + dx;
  const baseTop = Math.round((size - innerSize) / 2) + dy;

  return out
    .composite([{ input: wobbleBuf, left: baseLeft, top: baseTop }])
    .webp({ quality: 92 })
    .toBuffer();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const spec = readSpec();
  const specStages = stagesFromSpec(spec);
  const specGroupAnims = animsFromGroup(spec, args.group);

  const stages = args.stages.length
    ? args.stages
    : specStages.length
    ? specStages
    : DEFAULT_STAGES;
  let anims = args.anims.length ? args.anims : unique(specGroupAnims);
  if (!anims.length) {
    console.error(
      `[sprites] No anims resolved. Provide --anim <name>, --anims a,b,c, or --group core|comfort|training_tricks|extended|all.`
    );
    process.exitCode = 1;
    return;
  }

  console.log('[sprites] Generating MOCK JRT frames (for pipeline testing)...');
  console.log(
    `[sprites] stages=${stages.join(', ')} group=${args.group} anims=${
      anims.length
    } size=${args.size} margin=${args.margin} force=${args.force}`
  );

  ensureDir(FRAMES_ROOT);

  for (const stage of stages) {
    // If the user asked for the "all" group, include any already-existing
    // anim folders under this stage (from scaffold scripts) so we truly cover
    // everything present in frames/jrt.
    if (args.group === 'all') {
      const stageDir = path.join(framesRootForFolderDiscovery(), stage);
      const existingAnims = listDirs(stageDir);
      if (existingAnims.length) anims = unique([...anims, ...existingAnims]);
    }

    const srcSprite = stageSpritePath(stage);
    if (!fs.existsSync(srcSprite)) {
      console.warn(
        `[sprites] ${stage}: missing base sprite ${path.relative(
          ROOT,
          srcSprite
        )} (skipping)`
      );
      continue;
    }

    // Build a safe, smaller "inner sprite" once per stage.
    // eslint-disable-next-line no-await-in-loop
    const { buf: baseInnerBuf, inner: innerSize } = await buildInnerSprite({
      srcSpritePath: srcSprite,
      size: args.size,
      margin: args.margin,
    });

    for (const anim of anims) {
      const animDir = path.join(FRAMES_ROOT, stage, anim);
      ensureDir(animDir);

      const existing = listExistingFrames(animDir);
      if (existing.length && !args.force) {
        console.warn(
          `[sprites] ${stage}/${anim}: ${existing.length} existing frame(s) found; use --force to overwrite (skipping)`
        );
        continue;
      }

      const metaPath = metaPathFor(animDir);
      const meta = readJsonIfExists(metaPath) || {};
      const specDefaults = defaultsForAnim(spec, anim);

      const fps =
        args.fps ||
        Number(meta.fps) ||
        specDefaults.fps ||
        (anim === 'walk' ? 12 : 8);

      const frames =
        args.frames || Number(meta.frames) || specDefaults.suggestedFrames || 8;

      // Always ensure the folder meta aligns with the generator output.
      writeJson(metaPath, {
        fps,
        frameSize: args.size,
        frames,
        source: 'mock-generator',
      });

      for (let i = 0; i < frames; i += 1) {
        const frameName = `frame_${pad4(i + 1)}.webp`;
        const outPath = path.join(animDir, frameName);

        // eslint-disable-next-line no-await-in-loop
        const buf = await renderFrame({
          baseInnerBuf,
          innerSize,
          anim,
          size: args.size,
          margin: args.margin,
          i,
          frames,
          amplitude: args.amplitude,
          rotate: args.rotate,
        });

        // eslint-disable-next-line no-await-in-loop
        await sharp(buf).toFile(outPath);
      }

      console.log(
        `[sprites] ${stage}/${anim}: wrote ${frames} frame(s) -> ${path.relative(
          ROOT,
          animDir
        )}`
      );
    }
  }

  console.log('[sprites] Done. Next: npm run sprites:jrt:build');
}

main().catch((err) => {
  console.error('[sprites] Failed:', err);
  process.exitCode = 1;
});
