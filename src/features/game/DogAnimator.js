// Doggerz spritesheet config (per SPRITESHEET_SPEC.md):
//  - each frame is 128x128
//  - sheet is 2048x2048 → 16 columns x 16 rows
const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;
const COLUMNS = 16;
const ROWS = 16;

const SHEET_WIDTH = FRAME_WIDTH * COLUMNS; // 2048
const SHEET_HEIGHT = FRAME_HEIGHT * ROWS; // 2048

/**
 * Define animations and which row they use.
 * Adjust row/frames to match your actual sprite layout.
 */
const ANIMATIONS = {
  // Row mapping per SPRITESHEET_SPEC.md
  idle: {
    name: "idle",
    row: 0, // Idle (row 0)
    frames: 16,
    fps: 8,
  },
  idle_bark: {
    name: "idle_bark",
    row: 9, // Bark (row 9)
    frames: 16,
    fps: 15,
  },
  idle_scratch: {
    name: "idle_scratch",
    row: 10, // Scratch (row 10)
    frames: 16,
    fps: 10,
  },
  attention: {
    name: "attention",
    row: 3, // Sit/attention (row 3)
    frames: 16,
    fps: 10,
  },
  sleep: {
    name: "sleep",
    row: 8, // Sleep (row 8)
    frames: 16,
    fps: 8,
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
