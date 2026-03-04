/** @format */
// src/utils/mapPoseToDogAction.js

export const DEFAULT_DOG_ACTION = "idle";

export const DOG_ANIMATION_CATEGORIES = Object.freeze({
  MAINTENANCE: "maintenance",
  REST: "rest",
  HIGH_ALERT: "high_alert",
  PATHOLOGICAL: "pathological",
  ACTIVE: "active",
});

const POSE_ALIASES = {
  alert_idle: "alert",
  alerting: "alert",

  sitpretty: "sit_pretty",
  sit_pretty: "sit_pretty",
  "sit-pretty": "sit_pretty",

  rollover: "roll",
  roll_over: "roll",
  "roll-over": "roll",

  playdead: "play_dead",
  play_dead: "play_dead",
  "play-dead": "play_dead",

  calm: "calm_idle",
  gentle: "gentle_idle",
  confident: "confident_idle",
  quiet: "quiet_idle",
};

const POSE_TO_ACTION = {
  idle: "idle",
  alert: "idle",

  sit: "sit",
  stay: "stay",
  heel: "walk",

  paw: "paw",
  roll: "roll",
  bow: "bow",
  sit_pretty: "sit_pretty",
  play_dead: "sleep",

  calm_idle: "idle",
  gentle_idle: "idle",
  confident_idle: "idle",
  quiet_idle: "idle",
};

const MAINTENANCE_ACTIONS = new Set([
  "eat",
  "eating",
  "feed",
  "drink",
  "drinking",
  "water",
  "scratch",
  "scratching",
  "self_groom",
  "self_grooming",
  "groom",
  "grooming",
  "lick",
  "clean",
  "potty",
  "sniff",
]);

const REST_ACTIONS = new Set([
  "idle",
  "idle_resting",
  "rest",
  "nap",
  "light_sleep",
  "sleep",
  "sleeping",
  "deep_sleep",
  "rem_sleep",
  "deep_rem_sleep",
  "dream",
]);

const HIGH_ALERT_ACTIONS = new Set([
  "point_position",
  "point",
  "pointing",
  "territorial_bark",
  "gate_watch",
  "guard",
  "guarding",
  "watch",
]);

const PATHOLOGICAL_ACTIONS = new Set([
  "limping",
  "limp",
  "shivering",
  "lethargic_lay",
  "lethargy",
  "sick_lay",
  "ill",
  "sore",
  "dental_pain",
]);

export const KNOWN_DOG_ACTIONS = Object.freeze(
  Array.from(
    new Set([
      DEFAULT_DOG_ACTION,
      ...Object.values(POSE_TO_ACTION),
      "walk",
      "walk_left",
      "walk_right",
      "turn_walk_right",
      "bark",
      "scratch",
      "shake",
      "sleep",
      "sleep_auto",
      "wag",
      "trick",
      "eat",
      "drink",
      "lay_down",
      "rest",
      "nap",
      "idle_resting",
      "light_sleep",
      "deep_sleep",
      "rem_sleep",
      "deep_rem_sleep",
      "dream",
      ...MAINTENANCE_ACTIONS,
      ...REST_ACTIONS,
      ...HIGH_ALERT_ACTIONS,
      ...PATHOLOGICAL_ACTIONS,
    ])
  )
);

/**
 * Normalize a pose string safely
 */
export function normalizePoseKey(pose) {
  return String(pose ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w_]/g, "");
}

export function normalizeDogActionKey(action) {
  return String(action ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w_]/g, "");
}

/**
 * Resolve alias → canonical key
 */
export function resolvePoseKey(pose) {
  const key = normalizePoseKey(pose);
  return POSE_ALIASES[key] || key;
}

/**
 * Map a training/pose label to a dog animation action.
 *
 * @param {string} pose
 * @param {{
 *   fallback?: string,
 *   allowUnknown?: boolean,
 *   availableActions?: string[],
 *   strict?: boolean
 * }} [options]
 */
export function mapPoseToDogAction(pose, options = {}) {
  const {
    fallback = DEFAULT_DOG_ACTION,
    allowUnknown = false,
    availableActions = KNOWN_DOG_ACTIONS,
    strict = false,
  } = options;

  const resolvedKey = resolvePoseKey(pose);
  let action = POSE_TO_ACTION[resolvedKey] || resolvedKey;

  // If strict mode, only allow mapped actions
  if (strict && !POSE_TO_ACTION[resolvedKey]) {
    return fallback;
  }

  // Validate against available animation list
  if (!availableActions.includes(action)) {
    if (allowUnknown) {
      return action || fallback;
    }
    return fallback;
  }

  return action || fallback;
}

export function getDogAnimationCategory(actionLike) {
  const key = normalizeDogActionKey(actionLike);
  if (!key) return DOG_ANIMATION_CATEGORIES.ACTIVE;
  if (PATHOLOGICAL_ACTIONS.has(key))
    return DOG_ANIMATION_CATEGORIES.PATHOLOGICAL;
  if (HIGH_ALERT_ACTIONS.has(key)) return DOG_ANIMATION_CATEGORIES.HIGH_ALERT;
  if (MAINTENANCE_ACTIONS.has(key)) return DOG_ANIMATION_CATEGORIES.MAINTENANCE;
  if (REST_ACTIONS.has(key)) return DOG_ANIMATION_CATEGORIES.REST;
  return DOG_ANIMATION_CATEGORIES.ACTIVE;
}

export function isMaintenanceAnimation(actionLike) {
  return (
    getDogAnimationCategory(actionLike) === DOG_ANIMATION_CATEGORIES.MAINTENANCE
  );
}

export function isRestAnimation(actionLike) {
  return getDogAnimationCategory(actionLike) === DOG_ANIMATION_CATEGORIES.REST;
}
