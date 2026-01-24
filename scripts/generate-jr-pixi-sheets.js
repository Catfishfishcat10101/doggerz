/**
 * eslint-disable no-console
 * @format
 */

// scripts/generate-jr-pixi-sheets.js
// Deterministically generates Pixi-ready sprite sheets for a Jack Russell.
// Output:
//   public/sprites/jr/<stage>_<condition>.png
//   public/sprites/jack_russell_{puppy,adult,senior}.webp
//
// Why this exists:
// - Keeps the repo self-contained (no external art source files required).
// - Guarantees the sheet layout matches `src/features/game/sprites/jrManifest.json`.
//
// Usage:
//   node scripts/generate-jr-pixi-sheets.js
//   node scripts/generate-jr-pixi-sheets.js --stages=pup,adult --conditions=clean,dirty
//   node scripts/generate-jr-pixi-sheets.js --out=public/sprites/jr

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(
  ROOT,
  "src",
  "features",
  "game",
  "sprites",
  "jrManifest.json"
);

const argv = process.argv.slice(2);
function arg(name, def) {
  const prefix = `--${name}=`;
  const hit = argv.find((a) => a.startsWith(prefix));
  if (!hit) return def;
  return hit.slice(prefix.length);
}

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[sprites] Missing jrManifest: ${MANIFEST_PATH}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch (err) {
    console.error("[sprites] Failed to parse jrManifest:", err);
    process.exit(1);
  }
}

function parseList(value, fallback) {
  return String(value || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeStage(stage) {
  const s = String(stage || "")
    .trim()
    .toLowerCase();
  if (s === "pup" || s === "puppy") return "pup";
  if (s === "adult") return "adult";
  if (s === "senior" || s === "old") return "senior";
  return null;
}

function normalizeCondition(condition) {
  const c = String(condition || "")
    .trim()
    .toLowerCase();
  if (c === "clean") return "clean";
  if (c === "dirty") return "dirty";
  if (c === "fleas") return "fleas";
  if (c === "mange") return "mange";
  return null;
}

const CONDITION_TONES = {
  clean: null,
  dirty: { tint: { r: 110, g: 86, b: 60 }, alpha: 0.2 },
  fleas: { tint: { r: 80, g: 120, b: 70 }, alpha: 0.15 },
  mange: { tint: { r: 120, g: 120, b: 120 }, alpha: 0.22, saturate: 0.55 },
};

function seededRng(seed) {
  // Tiny LCG for deterministic overlays.
  let s = Number(seed) || 1;
  if (!Number.isFinite(s) || s <= 0) s = 1;
  return () => {
    // LCG: Numerical Recipes
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildDogFrameSvg({ stage, anim, frameIndex }) {
  const fur = "#f8fafc";
  const patch = "#b45309";
  const outline = "rgba(15,23,42,0.85)";
  const nose = "#0f172a";
  const eye = "#0f172a";
  const tongue = "#fb7185";
  const muzzleGrey = "#e5e7eb";

  const t = (Number(frameIndex) || 0) / 12;
  const wave = Math.sin(t * Math.PI * 2);

  const stageKey = String(stage || "pup");
  const s = stageKey === "pup" ? 0.92 : stageKey === "senior" ? 1.0 : 1.02;
  const headScale =
    stageKey === "pup" ? 1.12 : stageKey === "senior" ? 0.96 : 1.0;
  const legScale = stageKey === "pup" ? 0.88 : stageKey === "senior" ? 0.95 : 1;
  const muzzleTint = stageKey === "senior" ? muzzleGrey : fur;
  const earDrop = stageKey === "senior" ? 2.5 : stageKey === "pup" ? -0.5 : 0;

  const standBaseY = 78;
  const groundY = 106;

  let yOffset = 0;
  let tailAngle = -12;
  let legSwing = 0;
  let headTilt = 0;
  let pawLift = 0;
  let mouthOpen = 0;
  let showZ = false;
  let scratch = 0;

  const key = String(anim || "idle")
    .trim()
    .toLowerCase();
  if (key === "idle") {
    yOffset = wave * 1.4;
    tailAngle = wave * 10 - 10;
  } else if (key === "walk") {
    yOffset = 0.3;
    legSwing = wave * 6;
    tailAngle = wave * 6 - 6;
  } else if (key === "wag") {
    yOffset = wave * 0.6;
    tailAngle = wave * 32;
  } else if (key === "trick") {
    yOffset = -Math.abs(wave) * 10;
    pawLift = Math.max(0, wave) * 10;
    tailAngle = 18 + wave * 6;
  } else if (key === "sleep") {
    showZ = true;
  } else if (key === "bark") {
    headTilt = wave * 3;
    mouthOpen = wave > 0.2 ? 1 : 0;
    tailAngle = 6 + wave * 6;
  } else if (key === "scratch") {
    scratch = (wave + 1) / 2; // 0..1
    headTilt = -8;
    tailAngle = -6;
  }

  const cx = 64;
  const bodyRx = 34 * s;
  const bodyRy = 18 * s * (stageKey === "senior" ? 1.06 : 1);
  const bodyY = standBaseY + yOffset + (scratch ? 3 : 0);
  const bodyX = cx - (scratch ? 4 : 0);

  const headX = cx + 22 * s + (scratch ? -6 : 0);
  const headY = bodyY - 18 * s + (scratch ? 2 : 0);
  const headRx = 18 * s * headScale;
  const headRy = 16 * s * headScale;

  const legY = bodyY + bodyRy - 4;
  const legH = 22 * legScale;
  const legW = 9 * s;

  const frontLegX = cx + 8 * s + (legSwing ? legSwing * 0.7 : 0);
  const backLegX = cx - 18 * s + (legSwing ? -legSwing * 0.7 : 0);

  const tailBaseX = cx - bodyRx + 6;
  const tailBaseY = bodyY - 4;
  const tailLen = 26 * s;

  const faceAngle = headTilt;

  // Sleep pose: simpler, lying down + Zs.
  if (showZ) {
    const zY = 28 + (-(frameIndex % 12) / 12) * 10;
    const zX = 78 + (frameIndex % 12) * 0.35;
    const zOpacity = 0.45 + 0.25 * Math.max(0, wave);
    return [
      `<ellipse cx="64" cy="86" rx="${44 * s}" ry="${16 * s}" fill="${fur}" stroke="${outline}" stroke-width="2"/>`,
      `<ellipse cx="52" cy="82" rx="${22 * s}" ry="${10 * s}" fill="${patch}" opacity="0.85"/>`,
      `<ellipse cx="86" cy="84" rx="${18 * s}" ry="${12 * s}" fill="${fur}" stroke="${outline}" stroke-width="2"/>`,
      `<path d="M78 84 q8 6 16 0" fill="none" stroke="${outline}" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M80 80 q6 4 12 0" fill="none" stroke="${outline}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
      `<path d="M${zX} ${zY} l10 0 l-6 10 l10 0" fill="none" stroke="rgba(226,232,240,${zOpacity.toFixed(3)})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    ].join("");
  }

  const openMouth = mouthOpen ? 1 : 0;
  const mouthSvg = openMouth
    ? `<path d="M${headX + 10} ${headY + 8} q10 6 0 14 q-10-6 0-14" fill="${tongue}" opacity="0.9"/>`
    : `<path d="M${headX + 10} ${headY + 14} q10 6 18 0" fill="none" stroke="${outline}" stroke-width="2" stroke-linecap="round"/>`;

  const barkLines = openMouth
    ? [
        `<path d="M${headX + 30} ${headY + 8} l10 -6" stroke="rgba(226,232,240,0.55)" stroke-width="2" stroke-linecap="round"/>`,
        `<path d="M${headX + 32} ${headY + 18} l12 0" stroke="rgba(226,232,240,0.45)" stroke-width="2" stroke-linecap="round"/>`,
        `<path d="M${headX + 30} ${headY + 28} l10 6" stroke="rgba(226,232,240,0.4)" stroke-width="2" stroke-linecap="round"/>`,
      ].join("")
    : "";

  const scratchLines = scratch
    ? [
        `<path d="M${headX + 6} ${headY + 4} l8 -10" stroke="rgba(226,232,240,0.4)" stroke-width="2" stroke-linecap="round"/>`,
        `<path d="M${headX + 14} ${headY + 6} l10 -8" stroke="rgba(226,232,240,0.35)" stroke-width="2" stroke-linecap="round"/>`,
      ].join("")
    : "";

  const liftedPawY = pawLift ? -pawLift : 0;
  const pawLeg = pawLift
    ? `<rect x="${frontLegX - legW / 2}" y="${legY + liftedPawY}" width="${legW}" height="${Math.max(10, legH - 8)}" rx="${legW / 2}" fill="${fur}" stroke="${outline}" stroke-width="2"/>`
    : "";

  const baseLegs = [
    `<rect x="${frontLegX - legW / 2}" y="${legY}" width="${legW}" height="${legH}" rx="${legW / 2}" fill="${fur}" stroke="${outline}" stroke-width="2" opacity="0.95"/>`,
    `<rect x="${backLegX - legW / 2}" y="${legY}" width="${legW}" height="${legH}" rx="${legW / 2}" fill="${fur}" stroke="${outline}" stroke-width="2" opacity="0.95"/>`,
  ].join("");

  const hindLeg = scratch
    ? `<path d="M${cx - 10} ${legY + 10} q${12 * (0.6 + scratch)} ${8 * scratch} ${14 * (0.7 + scratch)} ${-8 * scratch}" fill="none" stroke="${outline}" stroke-width="6" stroke-linecap="round" opacity="0.65"/>`
    : "";

  const ears = [
    `<path d="M${headX - 8} ${headY - 6} q-10 ${10 + earDrop} -6 ${24 + earDrop} q10 -6 10 -18 z" fill="${patch}" opacity="0.92"/>`,
    `<path d="M${headX + 6} ${headY - 8} q-10 ${10 + earDrop} -4 ${26 + earDrop} q10 -8 10 -18 z" fill="${patch}" opacity="0.86"/>`,
  ].join("");

  const eyeY = headY + 4;
  const eyeX = headX + 4;

  return [
    // Tail (behind body)
    `<g transform="rotate(${tailAngle.toFixed(2)} ${tailBaseX} ${tailBaseY})">` +
      `<path d="M${tailBaseX} ${tailBaseY} l${tailLen} 0" stroke="${patch}" stroke-width="${6 * s}" stroke-linecap="round"/>` +
      `</g>`,

    // Legs (behind body)
    baseLegs,

    // Body
    `<ellipse cx="${bodyX}" cy="${bodyY}" rx="${bodyRx}" ry="${bodyRy}" fill="${fur}" stroke="${outline}" stroke-width="2"/>`,
    `<ellipse cx="${bodyX - 8}" cy="${bodyY - 6}" rx="${16 * s}" ry="${10 * s}" fill="${patch}" opacity="0.85"/>`,

    // Scratch hind-leg overlay
    hindLeg,

    // Head + face
    `<g transform="rotate(${faceAngle.toFixed(2)} ${headX} ${headY})">` +
      ears +
      `<ellipse cx="${headX}" cy="${headY}" rx="${headRx}" ry="${headRy}" fill="${fur}" stroke="${outline}" stroke-width="2"/>` +
      `<ellipse cx="${headX + 10}" cy="${headY + 10}" rx="${12 * s}" ry="${9 * s}" fill="${muzzleTint}" opacity="0.95"/>` +
      `<circle cx="${headX + 18}" cy="${headY + 12}" r="${2.6 * s}" fill="${nose}"/>` +
      `<circle cx="${eyeX}" cy="${eyeY}" r="${2.6 * s}" fill="${eye}"/>` +
      mouthSvg +
      `</g>`,

    // Lifted paw (foreground)
    pawLeg,

    // Bark lines / scratch lines
    barkLines,
    scratchLines,

    // Ground shadow
    `<ellipse cx="${cx}" cy="${groundY}" rx="${36 * s}" ry="${6 * s}" fill="rgba(0,0,0,0.10)"/>`,
  ].join("");
}

function buildSheetSvg({ stage, manifest }) {
  const frameW = Number(manifest?.frame?.width || 128);
  const frameH = Number(manifest?.frame?.height || 128);
  const columns = Math.max(1, Math.round(Number(manifest?.columns || 12)));
  const rows = Array.isArray(manifest?.rows) ? manifest.rows : [];

  const sheetW = frameW * columns;
  const sheetH = frameH * rows.length;

  const parts = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const anim = String(rows[rowIndex]?.anim || "idle");
    for (let col = 0; col < columns; col++) {
      const x = col * frameW;
      const y = rowIndex * frameH;
      const cell = buildDogFrameSvg({ stage, anim, frameIndex: col });
      parts.push(`<g transform="translate(${x} ${y})">${cell}</g>`);
    }
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}" viewBox="0 0 ${sheetW} ${sheetH}">\n` +
    parts.join("\n") +
    `\n</svg>\n`
  );
}

async function buildToneOverlay(width, height, tone) {
  if (!tone) return null;
  const color = tone.tint || { r: 0, g: 0, b: 0 };
  const alpha = clamp(Number(tone.alpha ?? 0), 0, 1);
  if (alpha <= 0) return null;

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: color.r, g: color.g, b: color.b, alpha },
    },
  })
    .png()
    .toBuffer();
}

async function buildFleasOverlay(width, height, seed) {
  const rng = seededRng(seed);
  const dots = [];
  const dotCount = Math.max(60, Math.round((width * height) / 32000));
  for (let i = 0; i < dotCount; i++) {
    const x = Math.round(rng() * width);
    const y = Math.round(rng() * height);
    const r = 0.9 + rng() * 1.8;
    const a = 0.12 + rng() * 0.22;
    dots.push(
      `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="rgba(10,10,10,${a.toFixed(3)})"/>`
    );
  }

  const svg =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n` +
    dots.join("\n") +
    `\n</svg>\n`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function writeStaticSprite({ stage, cleanSheetBuffer, frameW, frameH }) {
  const stageKey = String(stage || "pup");
  const name =
    stageKey === "adult"
      ? "jack_russell_adult.webp"
      : stageKey === "senior"
        ? "jack_russell_senior.webp"
        : "jack_russell_puppy.webp";

  const outPath = path.join(ROOT, "public", "sprites", name);
  await sharp(cleanSheetBuffer)
    .extract({ left: 0, top: 0, width: frameW, height: frameH })
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90 })
    .toFile(outPath);
  console.log(`[sprites] Wrote ${path.relative(ROOT, outPath)}`);
}

async function writeStage({ stage, conditions, outDir, manifest }) {
  const svg = buildSheetSvg({ stage, manifest });
  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const meta = await sharp(base).metadata();

  const frameW = Math.max(1, Math.round(Number(manifest?.frame?.width || 128)));
  const frameH = Math.max(
    1,
    Math.round(Number(manifest?.frame?.height || 128))
  );
  const columns = Math.max(1, Math.round(Number(manifest?.columns || 12)));
  const rows = Array.isArray(manifest?.rows) ? manifest.rows : [];
  const expectedW = frameW * columns;
  const expectedH = frameH * rows.length;

  if (meta.width !== expectedW || meta.height !== expectedH) {
    console.warn(
      `[sprites] WARN: ${stage} clean sheet is ${meta.width}x${meta.height}, expected ${expectedW}x${expectedH}`
    );
  }

  await writeStaticSprite({ stage, cleanSheetBuffer: base, frameW, frameH });

  for (const condition of conditions) {
    const outName = `${stage}_${condition}.png`;
    const outPath = path.join(outDir, outName);

    const tone = CONDITION_TONES[condition] || null;
    const overlayTone = await buildToneOverlay(meta.width, meta.height, tone);

    let pipeline = sharp(base);

    if (condition === "mange" && CONDITION_TONES.mange?.saturate) {
      pipeline = pipeline.modulate({
        saturation: CONDITION_TONES.mange.saturate,
        brightness: 0.95,
      });
    }

    if (overlayTone) {
      pipeline = pipeline.composite([
        { input: overlayTone, blend: "multiply" },
      ]);
    }

    if (condition === "fleas") {
      const fleas = await buildFleasOverlay(
        meta.width,
        meta.height,
        `${stage}:${condition}`
      );
      pipeline = pipeline.composite([{ input: fleas, blend: "over" }]);
    }

    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
    console.log(`[sprites] Wrote ${path.relative(ROOT, outPath)}`);
  }
}

async function main() {
  const manifest = readManifest();

  const outDir = path.resolve(
    ROOT,
    arg("out", path.join("public", "sprites", "jr"))
  );
  const stages = parseList(arg("stages", "pup,adult,senior"), "")
    .map(normalizeStage)
    .filter(Boolean);
  const conditions = parseList(arg("conditions", "clean,dirty,fleas,mange"), "")
    .map(normalizeCondition)
    .filter(Boolean);

  if (!stages.length) {
    console.error("[sprites] No valid stages specified.");
    process.exit(1);
  }
  if (!conditions.length) {
    console.error("[sprites] No valid conditions specified.");
    process.exit(1);
  }

  await fs.promises.mkdir(outDir, { recursive: true });
  await fs.promises.mkdir(path.join(ROOT, "public", "sprites"), {
    recursive: true,
  });

  for (const stage of stages) {
    await writeStage({ stage, conditions, outDir, manifest });
  }

  console.log("[sprites] Done.");
}

main().catch((err) => {
  console.error("[sprites] Failed:", err);
  process.exit(1);
});
