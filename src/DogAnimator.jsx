const SHEET_WIDTH = 1024;
const SHEET_HEIGHT = 1024;

export const FRAME_WIDTH = SHEET_WIDTH / 8;
export const FRAME_HEIGHT = SHEET_HEIGHT / 8;

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
};

export function getAnimationMeta(name) {
  return animations[name] ?? animations.idle;
}

export function nextFrame(animName, current) {
  const meta = getAnimationMeta(animName);
  const total = meta.frames || 1;
  const idx = Number.isFinite(current) ? current : 0;
  return (idx + 1) % total;
}