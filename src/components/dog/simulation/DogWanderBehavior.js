// src/components/dog/simulation/DogWanderBehavior.js
export const DOG_WORLD_WIDTH = 800;
export const DOG_WORLD_HEIGHT = 500;

const WORLD_MIN_X = 48;
const WORLD_MAX_X = DOG_WORLD_WIDTH - 48;
const WORLD_MIN_Y = 260;
const WORLD_MAX_Y = DOG_WORLD_HEIGHT - 36;

function clamp(n, lo, hi) {
  const value = Number(n);
  if (!Number.isFinite(value)) return lo;
  return Math.max(lo, Math.min(hi, value));
}

export function chooseWanderTarget() {
  return {
    x: clamp(
      WORLD_MIN_X + Math.random() * (WORLD_MAX_X - WORLD_MIN_X),
      WORLD_MIN_X,
      WORLD_MAX_X
    ),
    y: clamp(
      WORLD_MIN_Y + Math.random() * (WORLD_MAX_Y - WORLD_MIN_Y),
      WORLD_MIN_Y,
      WORLD_MAX_Y
    ),
  };
}
