// src/features/game/animationMap.js
// Central animation metadata per spritesheet variant.

export const FULL_SHEET_ANIMATIONS = {
  idle: { row: 0, fps: 8 },
  walk: { row: 1, fps: 12 },
  run: { row: 2, fps: 12 },
  sit: { row: 3, fps: 10 },
  lay: { row: 4, fps: 8 },
  eat: { row: 5, fps: 10 },
  play_ball: { row: 6, fps: 10 },
  play_tug: { row: 7, fps: 10 },
  sleep: { row: 8, fps: 6 },
  bark: { row: 9, fps: 15 },
  scratch: { row: 10, fps: 12 },
  shake: { row: 11, fps: 15 },
  potty: { row: 12, fps: 10 },
  sad: { row: 13, fps: 8 },
  excited: { row: 14, fps: 12 },
  special: { row: 15, fps: 12 },
};

export const LEGACY_SHEET_ANIMATIONS = {
  idle: { row: 0, fps: 8 },
  bark: { row: 1, fps: 12 },
  scratch: { row: 2, fps: 10 },
  attention: { row: 3, fps: 12 },
  sleep: { row: 4, fps: 6 },
};

export function getAnimationsForVariant(variant) {
  if (variant === "legacy") return LEGACY_SHEET_ANIMATIONS;
  return FULL_SHEET_ANIMATIONS;
}

export const RANDOM_IDLE_VARIANTS = [
  { name: "bark", weight: 2 },
  { name: "scratch", weight: 1 },
  { name: "sit", weight: 1 },
  { name: "lay", weight: 1 },
];

export function pickRandomIdleVariant() {
  const total = RANDOM_IDLE_VARIANTS.reduce((s, v) => s + v.weight, 0);
  let r = Math.random() * total;
  for (const v of RANDOM_IDLE_VARIANTS) {
    if (r < v.weight) return v.name;
    r -= v.weight;
  }
  return "idle";
}
