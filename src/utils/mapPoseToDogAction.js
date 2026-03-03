/** @format */
// src/utils/mapPoseToDogAction.js

export const DEFAULT_DOG_ACTION = "idle";

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

export const KNOWN_DOG_ACTIONS = Object.freeze(
  Array.from(
    new Set([
      DEFAULT_DOG_ACTION,
      ...Object.values(POSE_TO_ACTION),
      "walk",
      "bark",
      "scratch",
      "shake",
      "sleep",
      "wag",
      "trick",
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
