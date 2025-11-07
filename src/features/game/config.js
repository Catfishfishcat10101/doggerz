// src/config/game.js
export const WORLD = Object.freeze({
  PADDING: 16,
  YARD_FRACTION: 0.18,
  DOG_W: 64,
  DOG_H: 64,
});

export const SPEED_PX_SEC = Object.freeze({
  puppy: 90,
  adult: 75,
  senior: 60,
});

export const DECAY = Object.freeze({
  idle: { hunger: 0.8, energy: 0.4, cleanliness: 0.25, happiness: 0.2 },
  move: { hunger: 1.2, energy: 1.8, cleanliness: 0.5, happiness: -0.4 },
});

export const STAGES = Object.freeze(["puppy", "adult", "senior"]);
