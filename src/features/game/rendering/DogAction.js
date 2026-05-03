// src/features/game/rendering/DogAction.js
/**
 * @typedef {(
 *   | "idle"
 *   | "walk"
 *   | "bark"
 *   | "dig"
 *   | "sleep"
 *   | "paw"
 *   | "eat"
 *   | "drink"
 *   | "scratch"
 * )} DogAction
 */

export const DOG_ACTIONS = Object.freeze({
  idle: "idle",
  walk: "walk",
  bark: "bark",
  dig: "dig",
  sleep: "sleep",
  paw: "paw",
  eat: "eat",
  drink: "drink",
  scratch: "scratch",
});

export const DOG_ACTION_VALUES = Object.freeze(Object.values(DOG_ACTIONS));

export const ONE_SHOT_DOG_ACTIONS = Object.freeze(
  new Set([DOG_ACTIONS.bark, DOG_ACTIONS.dig, DOG_ACTIONS.paw])
);

export const LOOPING_DOG_ACTIONS = Object.freeze(
  new Set([
    DOG_ACTIONS.idle,
    DOG_ACTIONS.walk,
    DOG_ACTIONS.sleep,
    DOG_ACTIONS.eat,
    DOG_ACTIONS.drink,
    DOG_ACTIONS.scratch,
  ])
);

const DOG_ACTION_ALIASES = Object.freeze({
  idle_resting: DOG_ACTIONS.idle,
  idle_calm: DOG_ACTIONS.idle,
  idle_sleepy: DOG_ACTIONS.idle,
  walk_left: DOG_ACTIONS.walk,
  walk_right: DOG_ACTIONS.walk,
  turn_walk_left: DOG_ACTIONS.walk,
  turn_walk_right: DOG_ACTIONS.walk,
  run: DOG_ACTIONS.walk,
  heel: DOG_ACTIONS.walk,
  bark: DOG_ACTIONS.bark,
  speak: DOG_ACTIONS.bark,
  territorial_bark: DOG_ACTIONS.bark,
  dig: DOG_ACTIONS.dig,
  digging: DOG_ACTIONS.dig,
  sleep: DOG_ACTIONS.sleep,
  sleeping: DOG_ACTIONS.sleep,
  sleepy: DOG_ACTIONS.sleep,
  light_sleep: DOG_ACTIONS.sleep,
  deep_rem_sleep: DOG_ACTIONS.sleep,
  deep_sleep: DOG_ACTIONS.sleep,
  dream: DOG_ACTIONS.sleep,
  paw: DOG_ACTIONS.paw,
  shake: DOG_ACTIONS.paw,
  highfive: DOG_ACTIONS.paw,
  high_five: DOG_ACTIONS.paw,
  wave: DOG_ACTIONS.paw,
  eat: DOG_ACTIONS.eat,
  feed: DOG_ACTIONS.eat,
  quick_feed: DOG_ACTIONS.eat,
  drink: DOG_ACTIONS.drink,
  water: DOG_ACTIONS.drink,
  scratch: DOG_ACTIONS.scratch,
  dirty: DOG_ACTIONS.scratch,
  fleas: DOG_ACTIONS.scratch,
  mange: DOG_ACTIONS.scratch,
});

function normalizeDogActionKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/**
 * @param {unknown} value
 * @returns {value is DogAction}
 */
export function isDogAction(value) {
  return DOG_ACTION_VALUES.includes(String(value || ""));
}

/**
 * @param {unknown} value
 * @param {DogAction} [fallback]
 * @returns {DogAction}
 */
export function resolveDogAction(value, fallback = DOG_ACTIONS.idle) {
  const normalized = normalizeDogActionKey(value);
  if (isDogAction(normalized)) {
    return normalized;
  }
  const aliased = DOG_ACTION_ALIASES[normalized];
  return isDogAction(aliased) ? aliased : fallback;
}

export function normalizeDogAction(value) {
  return normalizeDogActionKey(value);
}
