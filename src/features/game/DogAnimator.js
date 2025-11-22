// src/features/game/DogAnimator.js
// @ts-nocheck

// Sheet geometry from SPRITESHEET_SPEC.md
const SHEET_SIZE = 2048; // 2048 x 2048 PNG
const FRAME_SIZE = 128; // 16 x 16 grid → 128px frames
const FRAMES_PER_ROW = 16; // 0–15 per row

// Core animation config: row + fps per spec.
// We use all 16 frames in each row by default.
const ANIMATION_CONFIG = {
  idle: { row: 0, fps: 8, frameCount: FRAMES_PER_ROW },
  walk: { row: 1, fps: 12, frameCount: FRAMES_PER_ROW },
  run: { row: 2, fps: 12, frameCount: FRAMES_PER_ROW },
  sit: { row: 3, fps: 8, frameCount: FRAMES_PER_ROW },
  lay: { row: 4, fps: 8, frameCount: FRAMES_PER_ROW },
  eat: { row: 5, fps: 10, frameCount: FRAMES_PER_ROW },
  playBall: { row: 6, fps: 10, frameCount: FRAMES_PER_ROW },
  playTug: { row: 7, fps: 10, frameCount: FRAMES_PER_ROW },
  sleep: { row: 8, fps: 8, frameCount: FRAMES_PER_ROW },
  bark: { row: 9, fps: 15, frameCount: FRAMES_PER_ROW },
  scratch: { row: 10, fps: 10, frameCount: FRAMES_PER_ROW },
  shake: { row: 11, fps: 15, frameCount: FRAMES_PER_ROW },
  potty: { row: 12, fps: 10, frameCount: FRAMES_PER_ROW },
  sad: { row: 13, fps: 8, frameCount: FRAMES_PER_ROW },
  excited: { row: 14, fps: 12, frameCount: FRAMES_PER_ROW },
  special: { row: 15, fps: 10, frameCount: FRAMES_PER_ROW },
};

const DEFAULT_META = {
  name: "idle",
  row: 0,
  frameCount: FRAMES_PER_ROW,
  fps: 8,
  frameWidth: FRAME_SIZE,
  frameHeight: FRAME_SIZE,
  sheetWidth: SHEET_SIZE,
  sheetHeight: SHEET_SIZE,
};

export function getAnimationMeta(name) {
  const cfg = ANIMATION_CONFIG[name] ?? ANIMATION_CONFIG.idle;

  return {
    ...DEFAULT_META,
    name,
    row: cfg.row,
    frameCount: cfg.frameCount ?? DEFAULT_META.frameCount,
    fps: cfg.fps ?? DEFAULT_META.fps,
  };
}

/**
 * Given current frame index for a specific animation, return the next index.
 * EnhancedDogSprite uses this to advance the background-position column.
 */
export function nextFrame(name, currentFrameIndex = 0) {
  const meta = getAnimationMeta(name);
  const frameCount = Math.max(1, meta.frameCount || 1);
  return (currentFrameIndex + 1) % frameCount;
}

/**
 * Pick what animation to use when the dog is "idle",
 * based on the stats section from your spec.
 */
export function pickIdleAnimationFromStats(stats = {}) {
  const hunger = stats.hunger ?? 50;
  const happiness = stats.happiness ?? 50;
  const energy = stats.energy ?? 50;
  const cleanliness = stats.cleanliness ?? 100;

  // Match the spec rules in a sane priority order:

  // Energy < 20 → sleep
  if (energy < 20) {
    return "sleep";
  }

  // Cleanliness < 30 → scratch (fleas)
  if (cleanliness < 30) {
    return "scratch";
  }

  // Happiness < 30 → sad
  if (happiness < 30) {
    return "sad";
  }

  // Happiness > 75 → excited
  if (happiness > 75 && energy > 40) {
    return "excited";
  }

  // Hunger > 70 → bark (occasional bark later, but for now: bark loop)
  if (hunger > 70) {
    return "bark";
  }

  // Neutral case
  return "idle";
}

/**
 * Handy helper if you ever want to debug / list states.
 */
export function listAnimations() {
  return Object.keys(ANIMATION_CONFIG);
}
