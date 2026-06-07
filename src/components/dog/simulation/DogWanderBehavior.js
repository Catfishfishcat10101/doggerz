// src/components/dog/simulation/DogWanderBehavior.js
export const DOG_WORLD_WIDTH = 960;
export const DOG_WORLD_HEIGHT = 540;

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

export function chooseWanderTarget(seed = Date.now()) {
  const value = Number(seed) || Date.now();
  const xUnit = Math.abs(Math.sin(value * 0.0017));
  const yUnit = Math.abs(Math.cos(value * 0.0011));

  return {
    x: clamp(96 + xUnit * (DOG_WORLD_WIDTH - 192), 0, DOG_WORLD_WIDTH),
    y: clamp(260 + yUnit * 210, 0, DOG_WORLD_HEIGHT),
    id: `wander_${Math.floor(value / 1000)}`,
    type: "wander",
    label: "Yard stroll",
    interaction: "wander",
    interactionRadius: 28,
  };
}
