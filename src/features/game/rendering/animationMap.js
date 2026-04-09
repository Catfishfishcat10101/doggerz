// src/features/game/rendering/animationMap.js

import { DOG_ACTIONS } from "./DogAction.js";
import {
  DEFAULT_DOG_ACTION,
  DOG_ANIMATION_MAP,
  LOOPING_RENDER_ACTIONS,
  ONE_SHOT_RENDER_ACTIONS,
  STABLE_DOG_ACTIONS,
  STABLE_DOG_ANIMATION_CONTRACT,
  resolveContractClipKey,
  resolveStableDogAction,
} from "./dogAnimationMap.js";

export const INTENDED_DOG_ACTIONS = Object.freeze({
  idle: DOG_ACTIONS.idle,
  idle_resting: "idle_resting",
  idle_calm: "idle_calm",
  walk: DOG_ACTIONS.walk,
  walk_left: "walk_left",
  walk_right: "walk_right",
  turn_walk_left: "turn_walk_left",
  turn_walk_right: "turn_walk_right",
  bark: DOG_ACTIONS.bark,
  speak: "speak",
  dig: DOG_ACTIONS.dig,
  sleep: DOG_ACTIONS.sleep,
  light_sleep: "light_sleep",
  deep_rem_sleep: "deep_rem_sleep",
  paw: DOG_ACTIONS.paw,
  shake: "shake",
  highfive: "highfive",
  eat: DOG_ACTIONS.eat,
  drink: DOG_ACTIONS.drink,
  scratch: DOG_ACTIONS.scratch,
  gate_watch: "gate_watch",
  sniff: "sniff",
});

export const DOG_ANIMATIONS = DOG_ANIMATION_MAP;
export const DEFAULT_ANIMATION = DEFAULT_DOG_ACTION;
export const SUPPORTED_RENDER_ACTIONS = Object.freeze(
  new Set([
    ...Array.from(LOOPING_RENDER_ACTIONS),
    ...Array.from(ONE_SHOT_RENDER_ACTIONS),
  ])
);

export function resolveRenderableActionKey(actionLike) {
  return resolveContractClipKey(actionLike);
}

export function resolveDogAnimationKey({
  desiredAction,
  overrideAction,
  isSleeping = false,
  isDirty = false,
  isBarking = false,
}) {
  if (String(overrideAction || "").trim()) {
    return resolveStableDogAction(overrideAction, DEFAULT_ANIMATION);
  }
  if (isSleeping) return DOG_ACTIONS.sleep;
  if (isBarking) return DOG_ACTIONS.bark;
  if (isDirty) return DOG_ACTIONS.scratch;
  return resolveStableDogAction(desiredAction, DEFAULT_ANIMATION);
}

export { STABLE_DOG_ACTIONS, STABLE_DOG_ANIMATION_CONTRACT };
