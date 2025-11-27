// src/constants/training.js
// Training-related constants and helpers for Doggerz

export const SKILL_LEVEL_STEP = 50;

// Potty training goal
export const POTTY_TRAINING_GOAL = 8;

// Potty trained multiplier
export const POTTY_TRAINED_POTTY_GAIN_MULTIPLIER = 0.65;

// Helper: XP needed for next skill level
export function getXpToNextLevel(xp, step = SKILL_LEVEL_STEP) {
  return step - (xp % step);
}

// Add more training-related constants and helpers here as needed
