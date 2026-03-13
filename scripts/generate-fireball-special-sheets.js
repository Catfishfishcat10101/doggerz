#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/assets/sprites/jr");
const FRAME = 64;
const PALETTE = Object.freeze({
  gold: "#f6d36a",
  goldSoft: "#f9e8a8",
  bark: "#7c5132",
  barkSoft: "#9b6a42",
  shadow: "rgba(20, 14, 10, 0.18)",
  muzzleGray: "#d5d1ca",
  question: "#ffe08a",
  accentBlue: "#8ed0ff",
  accentPink: "#ffafc9",
  accentGreen: "#8ddd8d",
  white: "#f9f6ef",
  black: "#1d120d",
});

const SOURCES = Object.freeze({
  pup: path.join(OUT_DIR, "pup_clean.png"),
  adult: path.join(OUT_DIR, "adult_clean.png"),
});

const SHEETS = [
  {
    stage: "pup",
    file: "pup_puppy_idle_pack.png",
    source: SOURCES.pup,
    frames: 4,
    columns: 4,
    fps: 7,
    scale: 0.72,
    motion: [
      { dx: 0, dy: 1, rotate: 0, tail: -6, blink: false },
      { dx: 1, dy: 0, rotate: 1.5, tail: 4, blink: false },
      { dx: 0, dy: -1, rotate: 0, tail: 8, blink: true },
      { dx: -1, dy: 0, rotate: -1.5, tail: -2, blink: false },
    ],
  },
  {
    stage: "pup",
    file: "pup_puppy_sleeping_pack.png",
    source: SOURCES.pup,
    frames: 4,
    columns: 4,
    fps: 5,
    scale: 0.68,
    sleep: true,
    motion: [
      { dx: -1, dy: 1, rotate: -82, breath: 0 },
      { dx: -1, dy: 2, rotate: -82, breath: 1 },
      { dx: 0, dy: 1, rotate: -81, breath: 0 },
      { dx: -1, dy: 2, rotate: -82, breath: 1 },
    ],
  },
  {
    stage: "pup",
    file: "pup_puppy_potty_success.png",
    source: SOURCES.pup,
    frames: 4,
    columns: 4,
    fps: 8,
    scale: 0.72,
    potty: true,
    motion: [
      { dx: 0, dy: 2, rotate: 0, burst: 0 },
      { dx: 0, dy: -2, rotate: 2.5, burst: 1 },
      { dx: 0, dy: -1, rotate: -2.5, burst: 2 },
      { dx: 1, dy: 1, rotate: 0, burst: 1 },
    ],
  },
  {
    stage: "pup",
    file: "pup_puppy_confused.png",
    source: SOURCES.pup,
    frames: 4,
    columns: 4,
    fps: 6,
    scale: 0.72,
    confused: true,
    motion: [
      { dx: 0, dy: 0, rotate: -6, qx: 40, qy: 10 },
      { dx: 0, dy: 1, rotate: 6, qx: 42, qy: 8 },
      { dx: 0, dy: 0, rotate: -5, qx: 38, qy: 10 },
      { dx: 0, dy: 1, rotate: 5, qx: 40, qy: 8 },
    ],
  },
  {
    stage: "adult",
    file: "adult_tornado.png",
    source: SOURCES.adult,
    frames: 6,
    columns: 6,
    fps: 12,
    scale: 0.74,
    tornado: true,
    motion: [
      { dx: 0, dy: 0, rotate: 0 },
      { dx: 0, dy: -1, rotate: 60 },
      { dx: 0, dy: 0, rotate: 120 },
      { dx: 0, dy: -1, rotate: 180 },
      { dx: 0, dy: 0, rotate: 240 },
      { dx: 0, dy: -1, rotate: 300 },
    ],
  },
  {
    stage: "adult",
    file: "adult_backflip.png",
    source: SOURCES.adult,
    frames: 8,
    columns: 4,
    fps: 10,
    scale: 0.74,
    backflip: true,
    motion: [
      { dx: -2, dy: 6, rotate: 0 },
      { dx: -1, dy: 1, rotate: 45 },
      { dx: 0, dy: -6, rotate: 90 },
      { dx: 2, dy: -10, rotate: 135 },
      { dx: 4, dy: -6, rotate: 180 },
      { dx: 5, dy: 0, rotate: 225 },
      { dx: 3, dy: 5, rotate: 300 },
      { dx: 0, dy: 7, rotate: 360 },
    ],
  },
  {
    stage: "adult",
    file: "adult_handstand.png",
    source: SOURCES.adult,
    frames: 6,
    columns: 6,
    fps: 8,
    scale: 0.72,
    handstand: true,
    motion: [
      { dx: -5, dy: 5, rotate: -92 },
      { dx: -3, dy: 4, rotate: -89 },
      { dx: -1, dy: 5, rotate: -91 },
      { dx: 1, dy: 4, rotate: -89 },
      { dx: 3, dy: 5, rotate: -91 },
      { dx: 5, dy: 4, rotate: -90 },
    ],
  },
  {
    stage: "adult",
    file: "adult_army_crawl.png",
    source: SOURCES.adult,
    frames: 6,
    columns: 6,
    fps: 8,
    scale: 0.78,
    crawl: true,
    motion: [
      { dx: -4, dy: 7, rotate: 0 },
      { dx: -2, dy: 8, rotate: 0 },
      { dx: 0, dy: 7, rotate: 0 },
      { dx: 2, dy: 8, rotate: 0 },
      { dx: 4, dy: 7, rotate: 0 },
      { dx: 6, dy: 8, rotate: 0 },
    ],
  },
  {
    stage: "senior",
    file: "senior_golden_years_idle.png",
    source: SOURCES.adult,
    frames: 4,
    columns: 4,
    fps: 5,
    scale: 0.73,
    goldenYears: true,
    motion: [
      { dx: 0, dy: 1, rotate: 0, tail: -2 },
      { dx: 1, dy: 0, rotate: 0.75, tail: 2 },
      { dx: 0, dy: -1, rotate: 0, tail: 3 },
      { dx: -1, dy: 0, rotate: -0.75, tail: -1 },
    ],
  },
  {
    stage: "senior",
    file: "senior_golden_years_sleeping.png",
    source: SOURCES.adult,
    frames: 4,
    columns: 4,
    fps: 4,
    scale: 0.69,
    sleep: true,
    goldenYears: true,
    motion: [
      { dx: -1, dy: 2, rotate: -82, breath: 0 },
      { dx: -1, dy: 3, rotate: -82, breath: 1 },
      { dx: 0, dy: 2, rotate: -81, breath: 0 },
      { dx: -1, dy: 3, rotate: -82, breath: 1 },
    ],
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function svgOverlay(markup = "") {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FRAME}" height="${FRAME}" viewBox="0 0 ${FRAME} ${FRAME}" shape-rendering="crispEdges">${markup}</svg>`
  );
}

function createShadow(width = 24, height = 8, y = 54, opacity = 0.18) {
  return `<ellipse cx="32" cy="${y}" rx="${width}" ry="${height}" fill="rgba(20,14,10,${opacity})" />`;
}

function createPottyBurst(level = 0) {
  const stars = [
    { x: 48, y: 18, r: 5 },
    { x: 54, y: 26, r: 4 },
    { x: 45, y: 29, r: 3 },
  ].slice(0, Math.max(1, level + 1));
  return stars
    .map(
      ({ x, y, r }) =>
        `<g transform="translate(${x} ${y})"><path d="M0 -${r} L${r / 3} -${r / 3} L${r} 0 L${r / 3} ${r / 3} L0 ${r} L-${r / 3} ${r / 3} L-${r} 0 L-${r / 3} -${r / 3}Z" fill="${PALETTE.accentGreen}" /></g>`
    )
    .join("");
}

function createQuestionMark(x = 40, y = 10) {
  return `<g transform="translate(${x} ${y})"><path d="M0 0c4-6 14-4 14 3 0 6-6 6-6 11" fill="none" stroke="${PALETTE.question}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /><circle cx="8" cy="18" r="2.2" fill="${PALETTE.question}" /></g>`;
}

function createTornadoRings() {
  return [18, 24, 30]
    .map(
      (r, index) =>
        `<ellipse cx="32" cy="38" rx="${r}" ry="${Math.max(4, 8 - index)}" fill="none" stroke="${index === 0 ? PALETTE.accentBlue : PALETTE.white}" stroke-width="2" opacity="${0.55 - index * 0.12}" />`
    )
    .join("");
}

function createBackflipTrail(frameIndex) {
  return [0, 1, 2]
    .map((offset) => {
      const alpha = 0.16 - offset * 0.04;
      const x = 18 + frameIndex * 4 - offset * 5;
      const y = 46 - Math.abs(3 - frameIndex) * 5 + offset * 2;
      return `<circle cx="${x}" cy="${y}" r="${5 - offset}" fill="rgba(249,246,239,${alpha})" />`;
    })
    .join("");
}

function createSleepBubbles(goldenYears = false) {
  const color = goldenYears ? PALETTE.goldSoft : PALETTE.accentBlue;
  return [
    `<text x="10" y="14" fill="${color}" font-size="10" font-family="monospace">z</text>`,
    `<text x="16" y="9" fill="${color}" font-size="8" font-family="monospace">z</text>`,
  ].join("");
}

function createGoldenHalo() {
  return `<ellipse cx="32" cy="30" rx="20" ry="18" fill="rgba(246,211,106,0.18)" />`;
}

function createClosedEyes() {
  return `<g><rect x="18" y="25" width="6" height="2" fill="${PALETTE.black}" /><rect x="26" y="25" width="6" height="2" fill="${PALETTE.black}" /></g>`;
}

function createMuzzleGray() {
  return `<g opacity="0.92"><rect x="10" y="25" width="10" height="6" rx="2" fill="${PALETTE.muzzleGray}" /><rect x="18" y="24" width="6" height="5" rx="2" fill="${PALETTE.muzzleGray}" /></g>`;
}

async function baseDogBuffer(source, scale = 0.72, extra = {}) {
  const target = Math.round(FRAME * clamp(scale, 0.4, 0.92));
  let pipeline = sharp(source).resize(target, target, { fit: "inside" });
  if (extra.goldenYears) {
    pipeline = pipeline.tint({ r: 242, g: 236, b: 220 });
  }
  return pipeline.png().toBuffer();
}

async function transformDog(baseBuffer, motion, opts = {}) {
  const rotate = Number(motion.rotate || 0);
  const flip = Boolean(opts.flip);

  let pipeline = sharp(baseBuffer);
  if (flip) pipeline = pipeline.flop();

  const transformed = await pipeline
    .rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  let nextBuffer = transformed;
  let next = await sharp(nextBuffer).metadata();
  if (next.width > FRAME || next.height > FRAME) {
    nextBuffer = await sharp(nextBuffer)
      .resize(FRAME - 4, FRAME - 4, { fit: "inside" })
      .png()
      .toBuffer();
    next = await sharp(nextBuffer).metadata();
  }

  const left = clamp(
    Math.round((FRAME - next.width) / 2 + Number(motion.dx || 0)),
    0,
    Math.max(0, FRAME - next.width)
  );
  const top = clamp(
    Math.round((FRAME - next.height) / 2 + Number(motion.dy || 0)),
    0,
    Math.max(0, FRAME - next.height)
  );

  const overlays = [];
  if (opts.sleep) {
    overlays.push(createShadow(22, 7, 54, 0.14));
    overlays.push(createSleepBubbles(opts.goldenYears));
  } else if (opts.crawl) {
    overlays.push(createShadow(24, 6, 55, 0.14));
  } else {
    overlays.push(createShadow());
  }

  if (opts.goldenYears) overlays.push(createGoldenHalo());
  if (opts.potty) overlays.push(createPottyBurst(Number(motion.burst || 0)));
  if (opts.confused) overlays.push(createQuestionMark(motion.qx, motion.qy));
  if (opts.tornado) overlays.push(createTornadoRings());
  if (opts.backflip)
    overlays.push(createBackflipTrail(Number(opts.frameIndex || 0)));
  if (opts.sleep) overlays.push(createClosedEyes());
  if (opts.goldenYears) overlays.push(createMuzzleGray());

  const compositeInput = nextBuffer;
  const frame = sharp({
    create: {
      width: FRAME,
      height: FRAME,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([
    { input: svgOverlay(overlays.join("")), left: 0, top: 0 },
    { input: compositeInput, left, top },
  ]);

  return frame.png().toBuffer();
}

async function buildSheet(spec) {
  const source = spec.stage === "senior" ? SOURCES.adult : spec.source;
  const base = await baseDogBuffer(source, spec.scale, {
    goldenYears: spec.goldenYears,
  });
  const frames = [];

  for (let i = 0; i < spec.frames; i += 1) {
    const motion = spec.motion[i] || spec.motion[spec.motion.length - 1] || {};
    frames.push(
      await transformDog(base, motion, {
        sleep: spec.sleep,
        potty: spec.potty,
        confused: spec.confused,
        tornado: spec.tornado,
        backflip: spec.backflip,
        crawl: spec.crawl,
        goldenYears: spec.goldenYears,
        frameIndex: i,
      })
    );
  }

  const rows = Math.ceil(spec.frames / spec.columns);
  const sheet = sharp({
    create: {
      width: spec.columns * FRAME,
      height: rows * FRAME,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(
    frames.map((input, index) => ({
      input,
      left: (index % spec.columns) * FRAME,
      top: Math.floor(index / spec.columns) * FRAME,
    }))
  );

  const outPath = path.join(OUT_DIR, spec.file);
  await sheet.png().toFile(outPath);
  console.log(`wrote ${path.relative(ROOT, outPath)}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const spec of SHEETS) {
    await buildSheet(spec);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
