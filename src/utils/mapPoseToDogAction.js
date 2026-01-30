/** @format */

// src/utils/mapPoseToDogAction.js
export const DEFAULT_DOG_ACTION = "idle";

const POSE_ALIASES = {
  alert_idle: "alert",
  alerting: "alert",
  sitpretty: "sit_pretty",
  sit_pretty: "sit_pretty",
  sit-pretty: "sit_pretty",
  rollover: "roll",
  roll_over: "roll",
  roll-over: "roll",
  playdead: "play_dead",
  play_dead: "play_dead",
  play-dead: "play_dead",
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
  heel: "walk", // if you don't have heel animation yet, walk is a decent proxy

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

export function normalizePoseKey(pose) {
  return String(pose || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function resolvePoseKey(pose) {
  const key = normalizePoseKey(pose);
  return POSE_ALIASES[key] || key;
}

/**
 * Map a training/pose label to a dog animation action.
 * @param {string} pose
 * @param {{ fallback?: string, allowUnknown?: boolean, availableActions?: string[] }} [options]
 */
export function mapPoseToDogAction(pose, options = {}) {
  const {
    fallback = DEFAULT_DOG_ACTION,
    allowUnknown = true,
    availableActions = KNOWN_DOG_ACTIONS,
  } = options;

  const key = resolvePoseKey(pose) || DEFAULT_DOG_ACTION;
  const action = POSE_TO_ACTION[key] || key || DEFAULT_DOG_ACTION;

  if (!allowUnknown && !availableActions.includes(action)) {
    return fallback;
  }

  return action || fallback;
}
