/** @format */
// src/utils/mapPoseToDogAction.js

import {
  DOG_ANIMATIONS,
  isKnownDogAnimation,
  normalizeDogAnimationKey,
  resolveDogAnimation,
} from "@/animation/dogAnimationMap.js";

export const DEFAULT_DOG_ACTION = DOG_ANIMATIONS.idle;

export const DOG_ANIMATION_CATEGORIES = Object.freeze({
  MAINTENANCE: "maintenance",
  REST: "rest",
  HIGH_ALERT: "high_alert",
  PATHOLOGICAL: "pathological",
  ACTIVE: "active",
});

const POSE_ALIASES = Object.freeze({
  alert_idle: "alert",
  alerting: "alert",
  sitpretty: "sit_pretty",
  "sit-pretty": "sit_pretty",
  rollover: "roll_over",
  "roll-over": "roll_over",
  playdead: "play_dead",
  "play-dead": "play_dead",
});

const POSE_TO_ACTION = Object.freeze({
  idle: DOG_ANIMATIONS.idle,
  alert: DOG_ANIMATIONS.gate_watch,
  sit: DOG_ANIMATIONS.sit,
  stay: DOG_ANIMATIONS.sit,
  heel: DOG_ANIMATIONS.walk,
  paw: DOG_ANIMATIONS.paw,
  shake: DOG_ANIMATIONS.shake,
  bow: DOG_ANIMATIONS.beg,
  sit_pretty: DOG_ANIMATIONS.beg,
  roll: DOG_ANIMATIONS.lay_down,
  roll_over: DOG_ANIMATIONS.lay_down,
  play_dead: DOG_ANIMATIONS.lay_down,
  speak: DOG_ANIMATIONS.bark,
});

const MAINTENANCE_ACTIONS = new Set([
  DOG_ANIMATIONS.eat,
  DOG_ANIMATIONS.drink,
  DOG_ANIMATIONS.scratch,
  DOG_ANIMATIONS.sniff,
]);

const REST_ACTIONS = new Set([
  DOG_ANIMATIONS.idle,
  DOG_ANIMATIONS.idle_resting,
  DOG_ANIMATIONS.sleep,
  DOG_ANIMATIONS.light_sleep,
  DOG_ANIMATIONS.deep_rem_sleep,
  DOG_ANIMATIONS.lay_down,
  DOG_ANIMATIONS.lethargic_lay,
]);

const HIGH_ALERT_ACTIONS = new Set([
  DOG_ANIMATIONS.gate_watch,
  DOG_ANIMATIONS.bark,
]);

const PATHOLOGICAL_ACTIONS = new Set([DOG_ANIMATIONS.lethargic_lay]);

export const KNOWN_DOG_ACTIONS = Object.freeze(
  Array.from(
    new Set([
      ...Object.values(DOG_ANIMATIONS),
      ...Object.values(POSE_TO_ACTION),
      ...MAINTENANCE_ACTIONS,
      ...REST_ACTIONS,
      ...HIGH_ALERT_ACTIONS,
      ...PATHOLOGICAL_ACTIONS,
    ])
  )
);

export function normalizePoseKey(pose) {
  return normalizeDogAnimationKey(pose).replace(/[^\w_]/g, "");
}

export function normalizeDogActionKey(action) {
  return normalizeDogAnimationKey(action).replace(/[^\w_]/g, "");
}

export function resolvePoseKey(pose) {
  const key = normalizePoseKey(pose);
  return POSE_ALIASES[key] || key;
}

export function mapPoseToDogAction(pose, options = {}) {
  const {
    fallback = DEFAULT_DOG_ACTION,
    allowUnknown = false,
    availableActions = KNOWN_DOG_ACTIONS,
    strict = false,
  } = options;

  const resolvedKey = resolvePoseKey(pose);
  const direct = POSE_TO_ACTION[resolvedKey];
  const action = direct || resolveDogAnimation(resolvedKey);

  if (strict && !direct) {
    return fallback;
  }

  if (!availableActions.includes(action)) {
    if (allowUnknown && isKnownDogAnimation(resolvedKey)) {
      return action || fallback;
    }
    return fallback;
  }

  return action || fallback;
}

export function getDogAnimationCategory(actionLike) {
  const key = normalizeDogActionKey(resolveDogAnimation(actionLike));
  if (!key) return DOG_ANIMATION_CATEGORIES.ACTIVE;
  if (PATHOLOGICAL_ACTIONS.has(key)) {
    return DOG_ANIMATION_CATEGORIES.PATHOLOGICAL;
  }
  if (HIGH_ALERT_ACTIONS.has(key)) {
    return DOG_ANIMATION_CATEGORIES.HIGH_ALERT;
  }
  if (MAINTENANCE_ACTIONS.has(key)) {
    return DOG_ANIMATION_CATEGORIES.MAINTENANCE;
  }
  if (REST_ACTIONS.has(key)) {
    return DOG_ANIMATION_CATEGORIES.REST;
  }
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
