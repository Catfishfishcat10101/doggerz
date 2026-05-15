// src/features/game/stage3d/dog/dogAnimationMap.js
import { LEGACY_DOG_MODEL_PATH } from "./dogModelMap.js";

export const DOG_MODEL_GLTF_PATH = LEGACY_DOG_MODEL_PATH;

export const REQUIRED_DOG_MODEL_CLIPS = Object.freeze([
  "Idle",
  "Walk",
  "Sit",
  "Sleep",
  "Wag",
]);

export const OPTIONAL_DOG_MODEL_CLIPS = Object.freeze([
  "Walk_Left",
  "Walk_Right",
  "Turn_Walk_Left",
  "Turn_Walk_Right",
  "Bark",
  "Scratch",
  "Eat",
  "Lay_Down",
  "Jump",
  "Fetch",
  "Beg",
  "Paw",
  "Shake",
  "HighFive",
  "Dance",
  "GateWatch",
  "Idle_Resting",
  "Light_Sleep",
  "Deep_Rem_Sleep",
  "Drink",
  "Sniff",
  "Lethargic_Lay",
]);

export const DOG_MODEL_CLIPS = Object.freeze([
  ...REQUIRED_DOG_MODEL_CLIPS,
  ...OPTIONAL_DOG_MODEL_CLIPS,
]);

export function hasPlayableDogModelClips(actions = {}) {
  const actionNames = Object.keys(actions || {});
  return REQUIRED_DOG_MODEL_CLIPS.every((clip) => actionNames.includes(clip));
}

export function resolveClipName(requestedClip = "Idle", actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  const normalizedRequest = String(requestedClip || "Idle").trim();
  if (actionNames.includes(normalizedRequest)) return normalizedRequest;
  return actionNames.includes("Idle") ? "Idle" : actionNames[0];
}
