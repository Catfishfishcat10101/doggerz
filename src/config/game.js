// Core game tuning: decay rates, thresholds, XP model, cadence.
export const TICK_HZ = 1; // 1 game tick per second

// Gentle baseline decay per second (no click-grind)
export const IDLE_DECAY_PER_SEC = Object.freeze({
  hunger: 0.06,
  energy: 0.03,
  cleanliness: 0.02,
  bladder: 0.04,
  happiness: 0.02,
});

// Movement / interaction decay multipliers
export const MOVE_DECAY_PER_SEC = Object.freeze({
  hunger: 0.10,
  energy: 0.18,
  cleanliness: 0.04,
  bladder: 0.06,
  happiness: -0.02, // interaction increases happiness slightly
});

// Clamps
export const STAT_MIN = 0;
export const STAT_MAX = 100;

// Mood thresholds (read-only)
export const MOOD = Object.freeze({
  ecstatic: 85,
  happy: 70,
  neutral: 50,
  grumpy: 30,
  critical: 15,
});

// XP model
export const XP = Object.freeze({
  perFeed: 5,
  perPlay: 8,
  perTrain: 10,
  perRestMinute: 1,
  levelCurve: (level) => Math.floor(50 + level * 25), // simple affine curve
});

// Unlock gates
export const UNLOCKS = Object.freeze({
  accessoriesAt: 8,
  breedingStubAt: 12, // future
});

// World geometry (used by movement/zone logic)
export const WORLD = Object.freeze({
  width: 1920,
  padding: 24,
  yardX: 1400, // x >= yardX is “outside”
});
export const ZONES = Object.freeze({
	bedroom: { x: 0, y: 0, width: 600, height: 1080 },
	kitchen: { x: 600, y: 0, width: 800, height: 1080 },
	bathroom: { x: 1400, y: 0, width: 520, height: 1080 },
});
export const ZONE_NAMES = Object.freeze(Object.keys(ZONES));

// Timeouts and intervals
export const TIME = Object.freeze({
	autoSaveMinutes: 1,
	awayTimeoutMinutes: 5,
	idleTimeoutMinutes: 3,
	nudgeIntervalMinutes: 10,
});
export const NOTIFICATIONS = Object.freeze({
	feedMinutes: 120,
	playMinutes: 90,
	trainMinutes: 180,
	restMinutes: 240,
	cleanMinutes: 300,
});
export const NOTIFICATION_CHECK_HZ = 1 / 60; // check every minute

// Export all as a single object for convenience