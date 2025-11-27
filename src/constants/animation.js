// Animation configuration constants for sprites and QA tuning
// Keep small and easy to override during testing.

// Idle animation settings per life stage. Each entry defines:
// - start: starting frame index within the sheet (column-major)
// - frames: number of frames in the idle cycle
// - interval: milliseconds between frames
export const IDLE_ANIM = {
  default: { start: 0, frames: 4, interval: 350 },
  puppy: { start: 0, frames: 4, interval: 320 },
  adult: { start: 16 * 0 + 0, frames: 6, interval: 280 },
  senior: { start: 0, frames: 4, interval: 420 },
};

// Global FPS if we later switch to RAF-based stepping (unused for now)
export const GLOBAL_FPS = 60;

export default {
  IDLE_ANIM,
  GLOBAL_FPS,
};
