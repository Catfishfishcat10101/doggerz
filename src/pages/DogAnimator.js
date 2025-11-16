// src/pages/DogAnimator.js

// Your spritesheet is 1024x1024 → 8 columns, 8 rows → 128px per frame.
const SHEET_WIDTH = 1024;
const SHEET_HEIGHT = 1024;

export const FRAME_WIDTH = SHEET_WIDTH / 8;   // 128px
export const FRAME_HEIGHT = SHEET_HEIGHT / 8; // 128px;

/**
 * Animation atlas for each dog behavior.
 * All rows and frames correspond directly to jack_russell_directions.png
 */
export const animations = {
  idle: {
    row: 0,
    frames: 4,
    fps: 4,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  idle_bark: {
    row: 1,
    frames: 4,
    fps: 6,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  idle_scratch: {
    row: 2,
    frames: 4,
    fps: 6,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  walk_left: {
    row: 3,
    frames: 6,
    fps: 10,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  walk_right: {
    row: 4,
    frames: 6,
    fps: 10,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  sleep: {
    row: 5,
    frames: 3,
    fps: 2,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  attention: {
    row: 6,
    frames: 5,
    fps: 5,
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  },

  // Optional row 7 reserved for future animations
};

/**
 * Returns animation metadata for a given name.
 */
export function getAnimationMeta(name) {
  return animations[name] ?? animations.idle;
}

/**
 * Moves animation forward.
 * Automatically loops based on animation's frame count.
 */
export function nextFrame(animName, current) {
  const meta = getAnimationMeta(animName);
  const total = meta.frames || 1;
  const idx = Number.isFinite(current) ? current : 0;
  return (idx + 1) % total;
}
