// src/features/game/stage3d/dog/dogAnimationMap.js
import { LEGACY_DOG_MODEL_PATH } from "./dogModelMap.js";

export const DOG_MODEL_GLTF_PATH = LEGACY_DOG_MODEL_PATH;

export const REQUIRED_DOG_MODEL_CLIPS = Object.freeze([
  "Idle_1",
  "Walk_F_IP",
  "Sitting_loop_1",
  "Lie_Sleep_loop",
]);

export const OPTIONAL_DOG_MODEL_CLIPS = Object.freeze([
  "Idle_2",
  "Idle_3",
  "Idle_4",
  "Idle_5_loop",
  "Idle_6",
  "Idle_7",
  "Bark",
  "Digging_loop",
  "Drink_loop",
  "Eat_loop",
  "Jump_Place_IP",
  "Lie_belly_loop_1",
  "Lie_belly_sleep",
  "Lie_loop_1",
  "Run_F_IP",
  "Scratching",
  "Sitting_loop_2",
  "Trot_F_IP",
  "Trot_L_IP",
  "Trot_R_IP",
  "Turn_L_IP",
  "Turn_R_IP",
  "Walk_B_IP",
  "Walk_L_IP",
  "Walk_R_IP",
]);

export const DOG_MODEL_CLIPS = Object.freeze([
  ...REQUIRED_DOG_MODEL_CLIPS,
  ...OPTIONAL_DOG_MODEL_CLIPS,
]);

const CLIP_CANDIDATES_BY_REQUEST = Object.freeze({
  Idle: ["Idle_1", "Idle_2", "Idle_3", "Idle_4", "Idle_5_loop"],
  Idle_Resting: ["Idle_5_loop", "Idle_6", "Idle_7", "Idle_1"],
  Walk: ["Walk_F_IP", "Trot_F_IP", "Run_F_IP"],
  Walk_Left: ["Walk_L_IP", "Trot_L_IP", "Turn_L_IP", "Walk_F_IP"],
  Walk_Right: ["Walk_R_IP", "Trot_R_IP", "Turn_R_IP", "Walk_F_IP"],
  Turn_Walk_Left: ["Turn_L_IP", "Walk_L_IP", "Trot_L_IP"],
  Turn_Walk_Right: ["Turn_R_IP", "Walk_R_IP", "Trot_R_IP"],
  Sit: ["Sitting_loop_1", "Sitting_loop_2", "Sitting_start"],
  Sleep: ["Lie_Sleep_loop", "Lie_belly_sleep", "Lie_loop_1"],
  Light_Sleep: ["Lie_loop_1", "Lie_belly_loop_1", "Lie_Sleep_loop"],
  Deep_Rem_Sleep: ["Lie_Sleep_loop", "Lie_belly_sleep"],
  Wag: ["Idle_2", "Idle_3", "Idle_1"],
  Bark: ["Bark", "Idle_1"],
  Scratch: ["Scratching", "Digging_loop", "Idle_1"],
  Sniff: ["Crouch_Idle_loop_1", "Crouch_Idle_loop_2", "Idle_4", "Idle_1"],
  Dig: ["Digging_loop", "Digging_start", "Scratching"],
  Eat: ["Eat_loop", "Eat_tear", "EatDrink_start"],
  Drink: ["Drink_loop", "EatDrink_start"],
  Jump: ["Jump_Place_IP", "JumpStart_Place", "JumpAir_Up"],
  Fetch: ["Run_F_IP", "Trot_F_IP", "Walk_F_IP"],
  Lay_Down: ["Lie_loop_1", "Lie_belly_loop_1", "Lie_start"],
  Lethargic_Lay: ["Lie_belly_loop_1", "Lie_loop_2", "Lie_Sleep_loop"],
  GateWatch: ["Idle_7", "Idle_6", "Idle_1"],
  Paw: ["Sitting_loop_1", "Idle_2"],
  Shake: ["Sitting_loop_2", "Idle_3"],
  HighFive: ["Sitting_loop_1", "Jump_Place_IP"],
  Dance: ["Idle_3", "Idle_2", "Trot_F_IP"],
  Beg: ["Sitting_loop_2", "Sitting_loop_1"],
});

function normalizeClipName(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function hasPlayableDogModelClips(actions = {}) {
  const actionNames = Object.keys(actions || {});
  return REQUIRED_DOG_MODEL_CLIPS.some((clip) => actionNames.includes(clip));
}

export function resolveClipName(requestedClip = "Idle", actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  const normalizedRequest = String(requestedClip || "Idle").trim();
  if (actionNames.includes(normalizedRequest)) return normalizedRequest;

  const candidates = CLIP_CANDIDATES_BY_REQUEST[normalizedRequest] || [];
  const matchedCandidate = candidates.find((clip) => actionNames.includes(clip));
  if (matchedCandidate) return matchedCandidate;

  const requestedKey = normalizeClipName(normalizedRequest);
  const fuzzyMatch = actionNames.find((name) =>
    normalizeClipName(name).includes(requestedKey)
  );
  if (fuzzyMatch) return fuzzyMatch;

  return (
    CLIP_CANDIDATES_BY_REQUEST.Idle.find((clip) => actionNames.includes(clip)) ||
    actionNames[0]
  );
}
