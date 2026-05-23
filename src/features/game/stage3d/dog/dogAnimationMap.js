// src/features/game/stage3d/dog/dogAnimationMap.js
import { LEGACY_DOG_MODEL_PATH } from "./dogModelMap.js";

export const DOG_MODEL_GLTF_PATH = LEGACY_DOG_MODEL_PATH;
export const FEED_START_CLIP = "EatDrink_start";
export const FEED_LOOP_CLIP = "Eat_loop";
const NEUTRAL_FEED_FALLBACK_CLIP = "Idle_1";

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
  "Crouch_F_IP",
  "Crouch_Idle_loop_1",
  "Crouch_Idle_loop_2",
  "Digging_loop",
  "Digging_start",
  "Drink_loop",
  "EatDrink_start",
  "Eat_loop",
  "Eat_tear",
  "JumpAir_high",
  "Jump_Place_IP",
  "JumpStart_Place",
  "JumpStart_Up",
  "JumpLand_Place",
  "Lie_belly_loop_1",
  "Lie_belly_loop_2",
  "Lie_belly_sleep",
  "Lie_belly_start",
  "Lie_start",
  "Lie_loop_1",
  "Lie_loop_2",
  "Run_F_IP",
  "Scratching",
  "Sitting_start",
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
  Feed: [FEED_LOOP_CLIP, FEED_START_CLIP, NEUTRAL_FEED_FALLBACK_CLIP],
  Eat: [FEED_LOOP_CLIP, FEED_START_CLIP, NEUTRAL_FEED_FALLBACK_CLIP],
  Drink: ["Drink_loop", "EatDrink_start"],
  Jump: ["Jump_Place_IP", "JumpStart_Place", "JumpAir_Up"],
  Fetch: ["Run_F_IP", "Trot_F_IP", "Walk_F_IP"],
  Lay_Down: ["Lie_loop_1", "Lie_belly_loop_1", "Lie_start"],
  Lethargic_Lay: ["Lie_belly_loop_1", "Lie_loop_2", "Lie_Sleep_loop"],
  GateWatch: ["Idle_7", "Idle_6", "Idle_1"],
  Paw: ["Sitting_loop_1", "Idle_2"],
  Shake: ["Sitting_loop_2", "Idle_3"],
  HighFive: ["Sitting_loop_1", "Jump_Place_IP"],
  High_Five: ["Sitting_loop_1", "Jump_Place_IP"],
  Dance: ["Idle_3", "Idle_2", "Trot_F_IP"],
  Beg: ["Sitting_loop_2", "Sitting_loop_1"],
  Speak: ["Bark", "Idle_1"],
  Sit_Pretty: ["Sitting_loop_2", "Sitting_loop_1"],
  Roll_Over: ["Lie_belly_start", "Lie_belly_loop_1", "Lie_loop_1"],
  Spin: ["Turn_R_IP", "Trot_R_IP", "Walk_R_IP", "Trot_F_IP"],
  Crawl: ["Crouch_F_IP", "Crouch_Idle_loop_1", "Walk_F_IP"],
  Play_Dead: ["Lie_belly_sleep", "Lie_belly_loop_1", "Lie_Sleep_loop"],
  Backflip: ["JumpStart_Up", "JumpAir_high", "Jump_Place_IP", "JumpLand_Place"],
});

function normalizeClipName(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const CLIP_REQUEST_ALIASES = Object.freeze({
  armycrawl: "Crawl",
  backflip: "Backflip",
  bark: "Bark",
  beg: "Beg",
  crawl: "Crawl",
  dance: "Dance",
  eat: "Eat",
  eating: "Eat",
  fetch: "Fetch",
  feed: "Feed",
  feeding: "Feed",
  feedquick: "Feed",
  food: "Feed",
  highfive: "High_Five",
  jump: "Jump",
  playdead: "Play_Dead",
  rollover: "Roll_Over",
  roll: "Roll_Over",
  shake: "Shake",
  sit: "Sit",
  sitpretty: "Sit_Pretty",
  speak: "Speak",
  spin: "Spin",
  treat: "Feed",
});

const FEEDING_ACTION_KEYS = new Set([
  "eat",
  "eating",
  "feed",
  "feeding",
  "feedquick",
  "food",
  "treat",
]);

export function resolveDogModelClipRequest(requestedClip = "Idle") {
  const raw = String(requestedClip || "Idle").trim();
  if (!raw) return "Idle";
  if (CLIP_CANDIDATES_BY_REQUEST[raw]) return raw;
  return CLIP_REQUEST_ALIASES[normalizeClipName(raw)] || raw;
}

export function isFeedingDogAction(actionLike = "") {
  const key = normalizeClipName(actionLike);
  if (!key) return false;
  if (FEEDING_ACTION_KEYS.has(key)) return true;
  return (
    key.startsWith("feed") || key.includes("food") || key.includes("treat")
  );
}

export function resolveFeedingClipName(phase = "loop", actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  if (phase === "start" && actionNames.includes(FEED_START_CLIP)) {
    return FEED_START_CLIP;
  }
  if (actionNames.includes(FEED_LOOP_CLIP)) return FEED_LOOP_CLIP;
  if (actionNames.includes(NEUTRAL_FEED_FALLBACK_CLIP)) {
    return NEUTRAL_FEED_FALLBACK_CLIP;
  }

  return (
    actionNames.find((name) => !normalizeClipName(name).includes("wag")) || null
  );
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

  const requestKey = resolveDogModelClipRequest(normalizedRequest);
  if (actionNames.includes(requestKey)) return requestKey;

  const candidates = CLIP_CANDIDATES_BY_REQUEST[requestKey] || [];
  const matchedCandidate = candidates.find((clip) =>
    actionNames.includes(clip)
  );
  if (matchedCandidate) return matchedCandidate;

  const requestedKey = normalizeClipName(requestKey);
  const fuzzyMatch = actionNames.find((name) =>
    normalizeClipName(name).includes(requestedKey)
  );
  if (fuzzyMatch) return fuzzyMatch;

  return (
    CLIP_CANDIDATES_BY_REQUEST.Idle.find((clip) =>
      actionNames.includes(clip)
    ) || actionNames[0]
  );
}
