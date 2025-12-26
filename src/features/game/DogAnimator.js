// src/DogAnimator.jsx
// @ts-nocheck

// Sprite sheet config:
//  - each frame is 64x64
//  - sheet is 256x320 → 4 columns x 5 rows
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const COLUMNS = 4;
const ROWS = 5;

const SHEET_WIDTH = FRAME_WIDTH * COLUMNS; // 256
const SHEET_HEIGHT = FRAME_HEIGHT * ROWS; // 320

/**
 * Define animations and which row they use.
 * Adjust row/frames to match your actual sprite layout.
 */
const ANIMATIONS = {
  idle: {
    name: "idle",
    row: 0, // row 0
    frames: 4, // 4 frames across
    fps: 6,
  },
  idle_bark: {
    name: "idle_bark",
    row: 1, // row 1
    frames: 4,
    fps: 10,
  },
  idle_scratch: {
    name: "idle_scratch",
    row: 2, // row 2
    frames: 4,
    fps: 8,
  },
  attention: {
    name: "attention",
    row: 3, // row 3
    frames: 4,
    fps: 10,
  },
  sleep: {
    name: "sleep",
    row: 4, // row 4 (last row)
    frames: 4, // change to 2 if last 2 frames are empty
    fps: 4,
  },
};

/**
 * Return metadata the view needs:
 *  - row
 *  - frameWidth / frameHeight
 *  - sheetWidth / sheetHeight
 *  - fps
 */
export function getAnimationMeta(name) {
  const key = typeof name === "string" ? name : "idle";
  const def = ANIMATIONS[key] || ANIMATIONS.idle;

  return {
    name: def.name,
    row: def.row,
    frames: def.frames,
    fps: def.fps,

    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
  };
}

/**
 * Advance to the next frame index for the animation.
 */
export function nextFrame(name, currentIndex) {
  const meta = getAnimationMeta(name);
  const total = meta.frames || 1;

  const idx = Number.isFinite(currentIndex) ? currentIndex : 0;
  return (idx + 1) % total;
}
