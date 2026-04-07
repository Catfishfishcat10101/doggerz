// src/features/game/rendering/animationMap.js

const STABLE_DOG_LAYOUT = Object.freeze({
  anchorX: 0.5,
  anchorY: 0.98,
  scaleMultiplier: 1,
  groundOffsetPx: 0,
});

// Long-term action names used by gameplay/simulation.
// Keep these stable as production sheets are swapped in later.
export const INTENDED_DOG_ACTIONS = Object.freeze({
  idle: "idle",
  idle_resting: "idle_resting",
  walk: "walk",
  bark: "bark",
  beg: "beg",
  scratch: "scratch",
  dig: "dig",
  sleep: "sleep",
});

const TEMP_CANONICAL_SHEET = "/assets/sprites/jr/pup_idle_resting.png";

// Temporary art safeguard policy:
// - Centralize sheet routing in one map.
// - Route unsupported/mismatched visuals to stable fallback actions.
// Replace these values with production-ready sheets per action when available.
const TEMP_SHEET_BY_ACTION = Object.freeze({
  [INTENDED_DOG_ACTIONS.idle]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.idle_resting]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.walk]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.bark]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.beg]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.scratch]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.dig]: TEMP_CANONICAL_SHEET,
  [INTENDED_DOG_ACTIONS.sleep]: TEMP_CANONICAL_SHEET,
});

const TEMP_ACTION_FALLBACK = Object.freeze({
  bark: "idle_resting",
  beg: "idle_resting",
  dig: "idle_resting",
});

function resolveSheetForAction(action) {
  return TEMP_SHEET_BY_ACTION[action] || TEMP_CANONICAL_SHEET;
}

function createAnimationConfig(action, { frameCount, fps, loop }) {
  return Object.freeze({
    src: resolveSheetForAction(action),
    columns: 4,
    rows: 4,
    frameCount,
    fps,
    loop,
    ...STABLE_DOG_LAYOUT,
  });
}

export const DOG_ANIMATIONS = Object.freeze({
  [INTENDED_DOG_ACTIONS.idle]: createAnimationConfig(
    INTENDED_DOG_ACTIONS.idle,
    { frameCount: 16, fps: 3, loop: true }
  ),
  [INTENDED_DOG_ACTIONS.idle_resting]: createAnimationConfig(
    INTENDED_DOG_ACTIONS.idle_resting,
    { frameCount: 16, fps: 3, loop: true }
  ),
  [INTENDED_DOG_ACTIONS.walk]: createAnimationConfig(
    INTENDED_DOG_ACTIONS.walk,
    { frameCount: 16, fps: 3, loop: true }
  ),
  [INTENDED_DOG_ACTIONS.bark]: createAnimationConfig(
    INTENDED_DOG_ACTIONS.bark,
    { frameCount: 4, fps: 4, loop: false }
  ),
  [INTENDED_DOG_ACTIONS.beg]: createAnimationConfig(INTENDED_DOG_ACTIONS.beg, {
    frameCount: 4,
    fps: 4,
    loop: false,
  }),
  [INTENDED_DOG_ACTIONS.scratch]: createAnimationConfig(
    INTENDED_DOG_ACTIONS.scratch,
    { frameCount: 4, fps: 3, loop: true }
  ),
  [INTENDED_DOG_ACTIONS.dig]: createAnimationConfig(INTENDED_DOG_ACTIONS.dig, {
    frameCount: 4,
    fps: 4,
    loop: false,
  }),
  [INTENDED_DOG_ACTIONS.sleep]: createAnimationConfig(
    INTENDED_DOG_ACTIONS.sleep,
    { frameCount: 4, fps: 2, loop: true }
  ),
});

export const DEFAULT_ANIMATION = "idle_resting";

const DOG_ANIMATION_ALIASES = Object.freeze({
  digging: "dig",
  walk_left: "walk",
  walk_right: "walk",
  turn_walk_left: "walk",
  turn_walk_right: "walk",
});

function normalizeAnimationKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function resolveSafeDisplayActionKey(actionLike) {
  const key = normalizeAnimationKey(actionLike);
  const aliased = DOG_ANIMATION_ALIASES[key] || key;
  if (!aliased) return DEFAULT_ANIMATION;
  // Temporary art policy: anything visually unsupported degrades to calm idle.
  const fallback = TEMP_ACTION_FALLBACK[aliased] || aliased;
  return DOG_ANIMATIONS[fallback] ? fallback : DEFAULT_ANIMATION;
}

export function resolveDogAnimationKey({
  desiredAction,
  overrideAction,
  isSleeping = false,
  isDirty = false,
  isBarking = false,
}) {
  const overrideKey = resolveSafeDisplayActionKey(overrideAction);
  if (normalizeAnimationKey(overrideAction) && DOG_ANIMATIONS[overrideKey]) {
    return overrideKey;
  }

  if (isSleeping && DOG_ANIMATIONS.sleep) {
    return "sleep";
  }

  // Bark should be one-shot via overrideAction only (not persistent state).
  void isBarking;

  if (isDirty && DOG_ANIMATIONS.scratch) {
    return "scratch";
  }

  const desiredKey = resolveSafeDisplayActionKey(desiredAction);
  if (desiredKey === "idle" && DOG_ANIMATIONS.idle_resting) {
    return "idle_resting";
  }
  if (desiredKey && DOG_ANIMATIONS[desiredKey]) {
    return desiredKey;
  }

  return DEFAULT_ANIMATION;
}
