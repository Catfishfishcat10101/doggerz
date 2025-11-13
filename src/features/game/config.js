// src/features/game/config.js

// The in-world playfield metrics (matches GameScene + DogSpriteView)
export const WORLD = Object.freeze({
  WIDTH: 480,
  HEIGHT: 320,

  PADDING: 16,

  // Rendered sprite footprint size
  DOG_SIZE: 160,

  // Allow zone detection later (Bowl/Bed/Bath/Potty)
  ZONES: {
    BOWL:  { x: 16,        y: 320 - 58, w: 100, h: 42 },
    BED:   { x: 480 - 116, y: 320 - 58, w: 100, h: 42 },
    BATH:  { x: 480 - 116, y: 16,       w: 100, h: 42 },
    POTTY: { x: 16,        y: 16,       w: 100, h: 42 },
  },
});

// Movement speed in px/sec (used for future animation upgrades)
export const SPEED_PX_SEC = Object.freeze({
  puppy: 90,
  adult: 75,
  senior: 60,
});

// Stat decay per second while in a behavior state
export const DECAY = Object.freeze({
  idle: {
    hunger: 0.8,
    energy: 0.4,
    cleanliness: 0.25,
    happiness: 0.2,
  },
  move: {
    hunger: 1.2,
    energy: 1.8,
    cleanliness: 0.5,
    happiness: -0.4,
  },
});

// Age/stage progression (one dog lifecycle)
export const STAGES = Object.freeze(["puppy", "adult", "senior"]);
