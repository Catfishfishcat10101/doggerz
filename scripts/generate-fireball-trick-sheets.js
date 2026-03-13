#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/assets/sprites/jr");

const SOURCES = Object.freeze({
  pup: path.join(OUT_DIR, "pup_clean.png"),
  adult: path.join(OUT_DIR, "adult_clean.png"),
});

const SHEETS = Object.freeze([
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_sit.png",
    frames: 4,
    columns: 4,
    overlay: "focus",
    motion: [{ dy: 1 }, { dy: 0 }, { dy: 1 }, { dy: 0 }],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_speak.png",
    frames: 4,
    columns: 4,
    overlay: "bark",
    motion: [{ dy: 1 }, { dy: 0 }, { dy: 1 }, { dy: 0 }],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_shake.png",
    frames: 4,
    columns: 4,
    overlay: "paw",
    motion: [{ dx: -1 }, { dx: 0 }, { dx: 1 }, { dx: 0 }],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_sit_pretty.png",
    frames: 6,
    columns: 6,
    overlay: "spark",
    motion: [
      { dy: 1 },
      { dy: -1 },
      { dy: -2 },
      { dy: -1 },
      { dy: 0 },
      { dy: 1 },
    ],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_roll_over.png",
    frames: 8,
    columns: 4,
    overlay: "roll",
    motion: [
      { rotate: 0 },
      { rotate: 35 },
      { rotate: 70 },
      { rotate: 110 },
      { rotate: 160 },
      { rotate: 220 },
      { rotate: 300 },
      { rotate: 360 },
    ],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_spin.png",
    frames: 6,
    columns: 6,
    overlay: "spin",
    motion: [
      { rotate: 0 },
      { rotate: 60 },
      { rotate: 120 },
      { rotate: 180 },
      { rotate: 240 },
      { rotate: 300 },
    ],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.74,
    file: "pup_crawl.png",
    frames: 6,
    columns: 6,
    overlay: "crawl",
    motion: [
      { dx: -2, dy: 2 },
      { dx: -1, dy: 3 },
      { dx: 0, dy: 2 },
      { dx: 1, dy: 3 },
      { dx: 2, dy: 2 },
      { dx: 3, dy: 3 },
    ],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_play_dead.png",
    frames: 6,
    columns: 6,
    overlay: "sleep",
    motion: [
      { rotate: 0 },
      { rotate: -25 },
      { rotate: -70 },
      { rotate: -84 },
      { rotate: -84 },
      { rotate: -84 },
    ],
  },
  {
    stage: "pup",
    frameSize: 32,
    scale: 0.72,
    file: "pup_backflip.png",
    frames: 6,
    columns: 6,
    overlay: "flip",
    motion: [
      { dy: 2 },
      { dy: 0, rotate: 45 },
      { dy: -2, rotate: 90 },
      { dy: -3, rotate: 180 },
      { dy: -1, rotate: 270 },
      { dy: 2, rotate: 360 },
    ],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_sit.png",
    frames: 4,
    columns: 4,
    overlay: "focus",
    motion: [{ dy: 2 }, { dy: 0 }, { dy: 2 }, { dy: 0 }],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_speak.png",
    frames: 4,
    columns: 4,
    overlay: "bark",
    motion: [{ dy: 2 }, { dy: 0 }, { dy: 2 }, { dy: 0 }],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_shake.png",
    frames: 4,
    columns: 4,
    overlay: "paw",
    motion: [{ dx: -2 }, { dx: 0 }, { dx: 2 }, { dx: 0 }],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_sit_pretty.png",
    frames: 6,
    columns: 6,
    overlay: "spark",
    motion: [
      { dy: 2 },
      { dy: -1 },
      { dy: -3 },
      { dy: -2 },
      { dy: 0 },
      { dy: 1 },
    ],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_roll_over.png",
    frames: 8,
    columns: 4,
    overlay: "roll",
    motion: [
      { rotate: 0 },
      { rotate: 35 },
      { rotate: 70 },
      { rotate: 110 },
      { rotate: 160 },
      { rotate: 220 },
      { rotate: 300 },
      { rotate: 360 },
    ],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_spin.png",
    frames: 6,
    columns: 6,
    overlay: "spin",
    motion: [
      { rotate: 0 },
      { rotate: 60 },
      { rotate: 120 },
      { rotate: 180 },
      { rotate: 240 },
      { rotate: 300 },
    ],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.78,
    file: "adult_crawl.png",
    frames: 6,
    columns: 6,
    overlay: "crawl",
    motion: [
      { dx: -4, dy: 5 },
      { dx: -2, dy: 6 },
      { dx: 0, dy: 5 },
      { dx: 2, dy: 6 },
      { dx: 4, dy: 5 },
      { dx: 6, dy: 6 },
    ],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_play_dead.png",
    frames: 6,
    columns: 6,
    overlay: "sleep",
    motion: [
      { rotate: 0 },
      { rotate: -25 },
      { rotate: -70 },
      { rotate: -84 },
      { rotate: -84 },
      { rotate: -84 },
    ],
  },
  {
    stage: "adult",
    frameSize: 64,
    scale: 0.74,
    file: "adult_backflip.png",
    frames: 6,
    columns: 6,
    overlay: "flip",
    motion: [
      { dy: 3 },
      { dy: 0, rotate: 45 },
      { dy: -5, rotate: 90 },
      { dy: -7, rotate: 180 },
      { dy: -2, rotate: 270 },
      { dy: 4, rotate: 360 },
    ],
  },
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function px(size, ratio) {
  return Math.round(size * ratio);
}

function svgOverlay(size, markup = "") {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${markup}</svg>`
  );
}

function overlayMarkup(type, size, frameIndex) {
  const stroke = Math.max(1, px(size, 0.05));
  const pale = "#f9f6ef";
  const bark = "#7c5132";
  const gold = "#f6d36a";
  const blue = "#8ed0ff";
  const green = "#8ddd8d";
  const shadow = `<ellipse cx="${px(size, 0.5)}" cy="${px(size, 0.86)}" rx="${px(size, 0.28)}" ry="${px(size, 0.08)}" fill="rgba(20,14,10,0.18)" />`;

  if (type === "bark") {
    return `${shadow}<path d="M ${px(size, 0.7)} ${px(size, 0.32)} q ${px(size, 0.07)} -${px(size, 0.08)} ${px(size, 0.13)} 0" fill="none" stroke="${blue}" stroke-width="${stroke}" stroke-linecap="round" /><path d="M ${px(size, 0.73)} ${px(size, 0.44)} q ${px(size, 0.09)} -${px(size, 0.1)} ${px(size, 0.16)} 0" fill="none" stroke="${pale}" stroke-width="${Math.max(1, stroke - 1)}" stroke-linecap="round" />`;
  }
  if (type === "paw") {
    return `${shadow}<circle cx="${px(size, 0.78)}" cy="${px(size, 0.35)}" r="${px(size, 0.06)}" fill="${gold}" /><circle cx="${px(size, 0.73)}" cy="${px(size, 0.3)}" r="${px(size, 0.025)}" fill="${gold}" /><circle cx="${px(size, 0.78)}" cy="${px(size, 0.26)}" r="${px(size, 0.025)}" fill="${gold}" /><circle cx="${px(size, 0.83)}" cy="${px(size, 0.3)}" r="${px(size, 0.025)}" fill="${gold}" />`;
  }
  if (type === "spark") {
    return `${shadow}<path d="M ${px(size, 0.8)} ${px(size, 0.18)} l ${px(size, 0.03)} ${px(size, 0.08)} l ${px(size, 0.08)} ${px(size, 0.03)} l -${px(size, 0.08)} ${px(size, 0.03)} l -${px(size, 0.03)} ${px(size, 0.08)} l -${px(size, 0.03)} -${px(size, 0.08)} l -${px(size, 0.08)} -${px(size, 0.03)} l ${px(size, 0.08)} -${px(size, 0.03)}z" fill="${gold}" />`;
  }
  if (type === "roll") {
    return `${shadow}<ellipse cx="${px(size, 0.5)}" cy="${px(size, 0.5)}" rx="${px(size, 0.34)}" ry="${px(size, 0.2)}" fill="none" stroke="rgba(249,246,239,0.25)" stroke-width="${Math.max(1, stroke - 1)}" />`;
  }
  if (type === "spin") {
    return `${shadow}<ellipse cx="${px(size, 0.5)}" cy="${px(size, 0.52)}" rx="${px(size, 0.34)}" ry="${px(size, 0.1)}" fill="none" stroke="${blue}" stroke-width="${Math.max(1, stroke - 1)}" opacity="0.7" /><ellipse cx="${px(size, 0.5)}" cy="${px(size, 0.42)}" rx="${px(size, 0.28)}" ry="${px(size, 0.08)}" fill="none" stroke="${pale}" stroke-width="${Math.max(1, stroke - 2)}" opacity="0.55" />`;
  }
  if (type === "crawl") {
    return `<ellipse cx="${px(size, 0.5)}" cy="${px(size, 0.88)}" rx="${px(size, 0.33)}" ry="${px(size, 0.06)}" fill="rgba(20,14,10,0.16)" />`;
  }
  if (type === "sleep") {
    return `${shadow}<text x="${px(size, 0.14)}" y="${px(size, 0.22)}" fill="${blue}" font-size="${px(size, 0.18)}" font-family="monospace">z</text>`;
  }
  if (type === "flip") {
    return `${shadow}${[0, 1, 2]
      .map((offset) => {
        const alpha = 0.18 - offset * 0.04;
        const x =
          px(size, 0.24) +
          frameIndex * px(size, 0.06) -
          offset * px(size, 0.07);
        const y =
          px(size, 0.72) -
          Math.abs(2 - frameIndex) * px(size, 0.08) +
          offset * px(size, 0.03);
        return `<circle cx="${x}" cy="${y}" r="${Math.max(1, px(size, 0.07) - offset)}" fill="rgba(249,246,239,${alpha})" />`;
      })
      .join("")}`;
  }
  return `${shadow}<circle cx="${px(size, 0.8)}" cy="${px(size, 0.25)}" r="${px(size, 0.035)}" fill="${green}" />`;
}

async function baseDogBuffer(source, frameSize, scale = 0.72) {
  const target = Math.max(1, Math.round(frameSize * clamp(scale, 0.45, 0.92)));
  return sharp(source)
    .resize(target, target, { fit: "inside" })
    .png()
    .toBuffer();
}

async function transformDog(baseBuffer, frameSize, motion = {}, spec = {}) {
  let pipeline = sharp(baseBuffer);
  if (spec.flip) pipeline = pipeline.flop();

  let transformed = await pipeline
    .rotate(Number(motion.rotate || 0), {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  let meta = await sharp(transformed).metadata();
  if (meta.width > frameSize || meta.height > frameSize) {
    transformed = await sharp(transformed)
      .resize(frameSize - 2, frameSize - 2, { fit: "inside" })
      .png()
      .toBuffer();
    meta = await sharp(transformed).metadata();
  }

  const left = clamp(
    Math.round((frameSize - meta.width) / 2 + Number(motion.dx || 0)),
    0,
    Math.max(0, frameSize - meta.width)
  );
  const top = clamp(
    Math.round((frameSize - meta.height) / 2 + Number(motion.dy || 0)),
    0,
    Math.max(0, frameSize - meta.height)
  );

  return sharp({
    create: {
      width: frameSize,
      height: frameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: svgOverlay(
          frameSize,
          overlayMarkup(spec.overlay, frameSize, Number(spec.frameIndex || 0))
        ),
        left: 0,
        top: 0,
      },
      { input: transformed, left, top },
    ])
    .png()
    .toBuffer();
}

async function buildSheet(spec) {
  const frameSize = Math.max(1, Number(spec.frameSize || 64));
  const source = SOURCES[spec.stage] || SOURCES.adult;
  const base = await baseDogBuffer(source, frameSize, spec.scale);
  const frames = [];

  for (let i = 0; i < spec.frames; i += 1) {
    frames.push(
      await transformDog(base, frameSize, spec.motion[i] || {}, {
        overlay: spec.overlay,
        frameIndex: i,
      })
    );
  }

  const rows = Math.ceil(spec.frames / spec.columns);
  const outPath = path.join(OUT_DIR, spec.file);
  await sharp({
    create: {
      width: spec.columns * frameSize,
      height: rows * frameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      frames.map((input, index) => ({
        input,
        left: (index % spec.columns) * frameSize,
        top: Math.floor(index / spec.columns) * frameSize,
      }))
    )
    .png()
    .toFile(outPath);
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
