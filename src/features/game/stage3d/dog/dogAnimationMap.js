// src/features/game/stage3d/dog/dogAnimationMap.js
export { DOG_MODEL_GLTF_PATH } from "./dogModelMap.js";

export const FEED_START_CLIP = "EatDrink_start";
export const FEED_LOOP_CLIP = "Eat_loop";

const DEFAULT_DOG_ANIMATION_CLIP = "Idle_1";
const NEUTRAL_FEED_FALLBACK_CLIP = DEFAULT_DOG_ANIMATION_CLIP;

export const RAW_DOG_MODEL_CLIPS = Object.freeze([
  "A_Pose",
  "Attack_Bite",
  "Attack_Bite_IP",
  "Attack_F",
  "Attack_J",
  "Attack_L",
  "Attack_R",
  "Bark",
  "cmd_paw",
  "cmd_sit",
  "cmd_speak",
  "cmd_stay",
  "Crouch_B_IP",
  "Crouch_BL_IP",
  "Crouch_BR_IP",
  "Crouch_F_IP",
  "Crouch_Idle_end",
  "Crouch_Idle_loop_1",
  "Crouch_Idle_loop_2",
  "Crouch_Idle_start",
  "Crouch_L_IP",
  "Crouch_R_IP",
  "Crouch_turn_L_IP",
  "Crouch_turn_R_IP",
  "Death_L",
  "Death_R",
  "Defecate",
  "Digging_end",
  "Digging_loop",
  "Digging_start",
  "Drink_loop",
  "Eat_loop",
  "Eat_tear",
  "EatDrink_end",
  "EatDrink_start",
  "Fall",
  "Hit_B",
  "Hit_F",
  "Hit_M",
  "Idle_1",
  "Idle_2",
  "Idle_3",
  "Idle_4",
  "Idle_5_end",
  "Idle_5_loop",
  "Idle_5_start",
  "Idle_6",
  "Idle_7",
  "Jump_F_IP",
  "Jump_Place_IP",
  "Jump_Run_IP",
  "JumpAir_high",
  "JumpAir_high_F",
  "JumpAir_Horiz",
  "JumpAir_low",
  "JumpAir_low_F",
  "JumpAir_Up",
  "JumpAir_Up_F",
  "JumpLand",
  "JumpLand_F_IP",
  "JumpLand_Place",
  "JumpStart_Down_IP",
  "JumpStart_F_IP",
  "JumpStart_Place",
  "JumpStart_Up",
  "JumpUp_End_IP",
  "Lie_belly_end",
  "Lie_belly_loop_1",
  "Lie_belly_loop_2",
  "Lie_belly_sleep",
  "Lie_belly_sleep_end",
  "Lie_belly_sleep_start",
  "Lie_belly_start",
  "Lie_end",
  "Lie_loop_1",
  "Lie_loop_2",
  "Lie_Sleep_end",
  "Lie_Sleep_loop",
  "Lie_Sleep_start",
  "Lie_start",
  "Pick_up",
  "Pick_up_idle",
  "Pissing",
  "Put_down",
  "Run_F_IP",
  "Run_L_IP",
  "Run_R_IP",
  "RunFast_F_IP",
  "RunFast_L_IP",
  "RunFast_R_IP",
  "Scratching",
  "Sitting_end",
  "Sitting_loop_1",
  "Sitting_loop_2",
  "Sitting_start",
  "Swim_B_IP",
  "Swim_BL_IP",
  "Swim_BR_IP",
  "Swim_enter_IP",
  "Swim_F_IP",
  "Swim_idle",
  "Swim_L_IP",
  "Swim_R_IP",
  "Swim_Turn_L_IP",
  "Swim_Turn_R_IP",
  "Trot_F_IP",
  "Trot_L_IP",
  "Trot_R_IP",
  "Turn_L180_IP",
  "Turn_L_IP",
  "Turn_R180_IP",
  "Turn_R_IP",
  "Walk_B_IP",
  "Walk_BL_IP",
  "Walk_BR_IP",
  "Walk_F_IP",
  "Walk_L_IP",
  "Walk_R_IP",
]);

function normalizeClipName(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function inferCategory(clipName = "") {
  const key = normalizeClipName(clipName);

  if (key.startsWith("idle")) return "idle";
  if (key.startsWith("walk")) return "locomotion";
  if (key.startsWith("run") || key.startsWith("runfast")) return "locomotion";
  if (key.startsWith("trot")) return "locomotion";
  if (key.startsWith("turn")) return "turn";
  if (key.startsWith("jump")) return "jump";
  if (key.startsWith("sitting") || key.startsWith("cmdsit")) return "sit";
  if (key.startsWith("lie")) return "rest";
  if (key.startsWith("crouch")) return "crouch";
  if (key.startsWith("digging")) return "dig";
  if (key.startsWith("eat") || key.startsWith("drink")) return "care";
  if (key === "bark" || key === "cmdspeak") return "voice";
  if (key === "defecate" || key === "pissing") return "potty";
  if (key.startsWith("swim")) return "swim";
  if (key.startsWith("attack") || key.startsWith("hit")) return "reaction";
  if (key.startsWith("death") || key === "fall") return "reaction";
  if (key.startsWith("pickup") || key.startsWith("putdown")) return "handler";
  if (key.startsWith("cmd")) return "command";

  return "utility";
}

function inferLoop(clipName = "", category = "") {
  const key = normalizeClipName(clipName);

  if (key.includes("loop") || key.endsWith("ip")) return true;
  if (["idle", "locomotion", "rest", "crouch", "swim"].includes(category)) {
    return !key.endsWith("start") && !key.endsWith("end");
  }

  return false;
}

function clipEntry(
  action,
  clip,
  {
    aliases = [],
    fallbacks = [],
    category = inferCategory(clip),
    loop = inferLoop(clip, category),
    priority = 100,
    polished = true,
  } = {}
) {
  return Object.freeze({
    action,
    clip,
    aliases: Object.freeze(aliases),
    fallbacks: Object.freeze([clip, ...fallbacks]),
    category,
    loop,
    priority,
    polished,
  });
}

const CANONICAL_ANIMATION_ENTRIES = Object.freeze({
  idle: clipEntry("idle", "Idle_1", {
    aliases: ["Idle", "idle_1", "default"],
    fallbacks: ["Idle_2", "Idle_3", "Idle_4", "Idle_5_loop"],
    category: "idle",
    loop: true,
    priority: 10,
  }),
  idleAlt: clipEntry("idleAlt", "Idle_5_loop", {
    aliases: ["idle_alt", "idleResting", "wag", "happy"],
    fallbacks: ["Idle_2", "Idle_3", "Idle_6", "Idle_7", "Idle_1"],
    category: "idle",
    loop: true,
    priority: 12,
  }),
  walk: clipEntry("walk", "Walk_F_IP", {
    aliases: ["Walk", "walkForward", "walk_in"],
    fallbacks: ["Trot_F_IP", "Run_F_IP", "Idle_1"],
    category: "locomotion",
    loop: true,
    priority: 20,
  }),
  run: clipEntry("run", "Run_F_IP", {
    aliases: ["Run", "runfast", "runFast", "run_wag_bark"],
    fallbacks: ["RunFast_F_IP", "Trot_F_IP", "Walk_F_IP"],
    category: "locomotion",
    loop: true,
    priority: 24,
  }),
  trot: clipEntry("trot", "Trot_F_IP", {
    aliases: ["Trot"],
    fallbacks: ["Walk_F_IP", "Run_F_IP", "Idle_1"],
    category: "locomotion",
    loop: true,
    priority: 22,
  }),
  sit: clipEntry("sit", "cmd_sit", {
    aliases: ["Sit", "sitting", "sitdown"],
    fallbacks: ["Sitting_loop_1", "Sitting_loop_2", "Sitting_start"],
    category: "command",
    loop: false,
    priority: 30,
  }),
  stay: clipEntry("stay", "cmd_stay", {
    aliases: ["Stay"],
    fallbacks: ["Sitting_loop_1", "Idle_5_loop", "Idle_1"],
    category: "command",
    loop: false,
    priority: 32,
  }),
  speak: clipEntry("speak", "cmd_speak", {
    aliases: ["Speak", "speakonce"],
    fallbacks: ["Bark", "Idle_1"],
    category: "command",
    loop: false,
    priority: 35,
  }),
  bark: clipEntry("bark", "Bark", {
    aliases: ["Bark", "returnAnnoyed", "bark_retreat"],
    fallbacks: ["cmd_speak", "Idle_1"],
    category: "voice",
    loop: false,
    priority: 34,
  }),
  sleepStart: clipEntry("sleepStart", "Lie_Sleep_start", {
    aliases: ["sleep_start"],
    fallbacks: ["Lie_belly_sleep_start", "Lie_start", "Lie_belly_start"],
    category: "rest",
    loop: false,
    priority: 40,
  }),
  sleepLoop: clipEntry("sleepLoop", "Lie_Sleep_loop", {
    aliases: ["Sleep", "sleep", "sleeping", "rest", "returnSleeping"],
    fallbacks: ["Lie_belly_sleep", "Lie_loop_1", "Lie_belly_loop_1"],
    category: "rest",
    loop: true,
    priority: 41,
  }),
  sleepEnd: clipEntry("sleepEnd", "Lie_Sleep_end", {
    aliases: ["sleep_end"],
    fallbacks: ["Lie_belly_sleep_end", "Lie_end", "Lie_belly_end"],
    category: "rest",
    loop: false,
    priority: 42,
  }),
  eat: clipEntry("eat", FEED_LOOP_CLIP, {
    aliases: ["Eat", "feed", "feeding", "food", "treat", "feedQuick"],
    fallbacks: [FEED_START_CLIP, "Eat_tear", NEUTRAL_FEED_FALLBACK_CLIP],
    category: "care",
    loop: true,
    priority: 50,
  }),
  drink: clipEntry("drink", "Drink_loop", {
    aliases: ["Drink", "water", "drinkWater"],
    fallbacks: [FEED_START_CLIP, NEUTRAL_FEED_FALLBACK_CLIP],
    category: "care",
    loop: true,
    priority: 51,
  }),
  digStart: clipEntry("digStart", "Digging_start", {
    aliases: ["dig_start"],
    fallbacks: ["Digging_loop", "Scratching", NEUTRAL_FEED_FALLBACK_CLIP],
    category: "dig",
    loop: false,
    priority: 60,
  }),
  digLoop: clipEntry("digLoop", "Digging_loop", {
    aliases: ["Dig", "dig", "digging", "scratch", "scratching"],
    fallbacks: ["Scratching", "Digging_start", NEUTRAL_FEED_FALLBACK_CLIP],
    category: "dig",
    loop: true,
    priority: 61,
  }),
  digEnd: clipEntry("digEnd", "Digging_end", {
    aliases: ["dig_end"],
    fallbacks: ["Digging_loop", "Scratching", NEUTRAL_FEED_FALLBACK_CLIP],
    category: "dig",
    loop: false,
    priority: 62,
  }),
  potty: clipEntry("potty", "Defecate", {
    aliases: ["poop", "pee", "pissing", "Pissing"],
    fallbacks: ["Pissing", NEUTRAL_FEED_FALLBACK_CLIP],
    category: "potty",
    loop: false,
    priority: 70,
  }),
  sniff: clipEntry("sniff", "Crouch_Idle_loop_1", {
    aliases: ["Sniff", "lookAround", "idle_watch"],
    fallbacks: ["Crouch_Idle_loop_2", "Crouch_F_IP", "Idle_4", "Idle_1"],
    category: "crouch",
    loop: true,
    priority: 44,
  }),
  paw: clipEntry("paw", "cmd_paw", {
    aliases: ["Paw"],
    fallbacks: ["Sitting_loop_2", "Sitting_loop_1", "Idle_2"],
    category: "command",
    loop: false,
    priority: 80,
  }),
  laydown: clipEntry("laydown", "Lie_start", {
    aliases: ["Lay_Down", "lay_down", "layDown", "lie"],
    fallbacks: ["Lie_loop_1", "Lie_belly_start", "Lie_belly_loop_1"],
    category: "rest",
    loop: false,
    priority: 43,
  }),
  turnLeft: clipEntry("turnLeft", "Turn_L_IP", {
    aliases: ["turn_left", "Turn_Walk_Left", "walkLeft", "Walk_Left"],
    fallbacks: ["Turn_L180_IP", "Walk_L_IP", "Trot_L_IP", "Crouch_turn_L_IP"],
    category: "turn",
    loop: true,
    priority: 25,
  }),
  turnRight: clipEntry("turnRight", "Turn_R_IP", {
    aliases: ["turn_right", "Turn_Walk_Right", "walkRight", "Walk_Right"],
    fallbacks: ["Turn_R180_IP", "Walk_R_IP", "Trot_R_IP", "Crouch_turn_R_IP"],
    category: "turn",
    loop: true,
    priority: 25,
  }),
  jump: clipEntry("jump", "Jump_Place_IP", {
    aliases: ["Jump", "fetch", "Fetch", "jump_paw_glass"],
    fallbacks: ["JumpStart_Place", "JumpAir_Up", "JumpAir_high", "JumpLand_Place"],
    category: "jump",
    loop: true,
    priority: 85,
  }),
  shake: clipEntry("shake", "cmd_paw", {
    aliases: ["Shake"],
    fallbacks: ["Sitting_loop_2", "Sitting_loop_1", "Idle_2"],
    category: "command",
    loop: false,
    priority: 81,
  }),
  highFive: clipEntry("highFive", "cmd_paw", {
    aliases: ["HighFive", "High_Five", "high_five"],
    fallbacks: ["Sitting_loop_2", "Sitting_loop_1", "Jump_Place_IP"],
    category: "command",
    loop: false,
    priority: 82,
  }),
  sitPretty: clipEntry("sitPretty", "Sitting_loop_2", {
    aliases: ["Sit_Pretty", "sit_pretty", "beg", "Beg"],
    fallbacks: ["Sitting_loop_1", "cmd_sit", "Idle_2"],
    category: "command",
    loop: true,
    priority: 83,
  }),
  happy: clipEntry("happy", "Idle_3", {
    aliases: ["Wag", "returnGreet", "dailyReward", "play"],
    fallbacks: ["Idle_2", "Idle_5_loop", "Trot_F_IP", "Idle_1"],
    category: "emotion",
    loop: true,
    priority: 45,
  }),
  sad: clipEntry("sad", "Lie_belly_loop_2", {
    aliases: ["sad_idle", "lethargic", "Lethargic_Lay"],
    fallbacks: ["Lie_loop_2", "Lie_Sleep_loop", "Idle_7"],
    category: "emotion",
    loop: true,
    priority: 46,
  }),
  alert: clipEntry("alert", "Idle_7", {
    aliases: ["GateWatch", "alert_idle"],
    fallbacks: ["Idle_6", "Idle_4", "Bark", "Idle_1"],
    category: "emotion",
    loop: true,
    priority: 47,
  }),
  lookAround: clipEntry("lookAround", "Idle_6", {
    aliases: ["look_around", "watch", "Idle_Resting"],
    fallbacks: ["Idle_7", "Idle_4", "Crouch_Idle_loop_1", "Idle_1"],
    category: "idle",
    loop: true,
    priority: 48,
  }),
  scratch: clipEntry("scratch", "Scratching", {
    aliases: ["Scratch"],
    fallbacks: ["Digging_loop", "Idle_5_loop", "Idle_1"],
    category: "dig",
    loop: false,
    priority: 63,
  }),
  crawl: clipEntry("crawl", "Crouch_F_IP", {
    aliases: ["Crawl", "armyCrawl"],
    fallbacks: ["Crouch_Idle_loop_1", "Walk_F_IP", "Idle_1"],
    category: "crouch",
    loop: true,
    priority: 84,
  }),
  rollOver: clipEntry("rollOver", "Lie_belly_start", {
    aliases: ["Roll_Over", "rollover", "roll"],
    fallbacks: ["Lie_belly_loop_1", "Lie_loop_1", "Lie_belly_sleep"],
    category: "command",
    loop: false,
    priority: 85,
  }),
  spin: clipEntry("spin", "Turn_R_IP", {
    aliases: ["Spin"],
    fallbacks: ["Trot_R_IP", "Walk_R_IP", "Trot_F_IP"],
    category: "command",
    loop: true,
    priority: 86,
  }),
  playDead: clipEntry("playDead", "Lie_belly_sleep", {
    aliases: ["Play_Dead", "play_dead"],
    fallbacks: ["Lie_belly_loop_1", "Lie_Sleep_loop", "Lie_loop_1"],
    category: "command",
    loop: true,
    priority: 87,
  }),
  backflip: clipEntry("backflip", "JumpStart_Up", {
    aliases: ["Backflip"],
    fallbacks: ["JumpAir_high", "JumpAir_Up", "Jump_Place_IP", "JumpLand_Place"],
    category: "command",
    loop: false,
    priority: 91,
  }),
});

const RAW_ANIMATION_ENTRIES = Object.freeze(
  Object.fromEntries(
    RAW_DOG_MODEL_CLIPS.map((clip) => {
      const action = `raw:${clip}`;
      return [
        action,
        clipEntry(action, clip, {
          aliases: [clip],
          category: inferCategory(clip),
          loop: inferLoop(clip),
          priority: 500,
          polished: false,
        }),
      ];
    })
  )
);

export const DOG_ANIMATION_REGISTRY = Object.freeze({
  ...CANONICAL_ANIMATION_ENTRIES,
  ...RAW_ANIMATION_ENTRIES,
});

export const DOG_ACTIONS = Object.freeze(
  Object.fromEntries(
    Object.keys(CANONICAL_ANIMATION_ENTRIES).map((action) => [action, action])
  )
);

export const DOG_ANIMATION_CLIPS = Object.freeze(
  Object.fromEntries(
    Object.entries(CANONICAL_ANIMATION_ENTRIES).map(([action, entry]) => [
      action,
      entry.clip,
    ])
  )
);

export const DOG_ACTION_ALIASES = Object.freeze(
  Object.fromEntries(
    Object.values(CANONICAL_ANIMATION_ENTRIES).flatMap((entry) => [
      [normalizeClipName(entry.action), entry.action],
      [normalizeClipName(entry.clip), entry.action],
      ...entry.aliases.map((alias) => [normalizeClipName(alias), entry.action]),
    ])
  )
);

const DOG_ANIMATION_BY_KEY = Object.freeze(
  Object.fromEntries(
    Object.values(DOG_ANIMATION_REGISTRY).flatMap((entry) => [
      [normalizeClipName(entry.action), entry],
      [normalizeClipName(entry.clip), entry],
      ...entry.aliases.map((alias) => [normalizeClipName(alias), entry]),
    ])
  )
);

const DOG_MODEL_CLIP_SET = new Set(RAW_DOG_MODEL_CLIPS);
const CANONICAL_DOG_MODEL_CLIPS = Object.freeze(
  Object.values(CANONICAL_ANIMATION_ENTRIES).map((entry) => entry.clip)
);

export const REQUIRED_DOG_MODEL_CLIPS = Object.freeze([
  "Idle_1",
  "Walk_F_IP",
  "Sitting_loop_1",
  "Lie_Sleep_loop",
]);

export const OPTIONAL_DOG_MODEL_CLIPS = Object.freeze(
  RAW_DOG_MODEL_CLIPS.filter((clip) => !REQUIRED_DOG_MODEL_CLIPS.includes(clip))
);

export const DOG_MODEL_CLIPS = RAW_DOG_MODEL_CLIPS;

export const IDLE_LIKE_DOG_CLIPS = Object.freeze([
  "Idle_1",
  "Idle_2",
  "Idle_3",
  "Idle_4",
  "Idle_5_loop",
  "Idle_6",
  "Idle_7",
]);

export const WALK_LIKE_DOG_CLIPS = Object.freeze([
  "Walk_F_IP",
  "Walk_L_IP",
  "Walk_R_IP",
  "Walk_B_IP",
  "Walk_BL_IP",
  "Walk_BR_IP",
]);

export const RUN_LIKE_DOG_CLIPS = Object.freeze([
  "Run_F_IP",
  "Run_L_IP",
  "Run_R_IP",
  "RunFast_F_IP",
  "RunFast_L_IP",
  "RunFast_R_IP",
]);

export const SLEEP_LIKE_DOG_CLIPS = Object.freeze([
  "Lie_Sleep_loop",
  "Lie_belly_sleep",
  "Lie_loop_1",
  "Lie_loop_2",
]);

export const BARK_LIKE_DOG_CLIPS = Object.freeze(["Bark", "cmd_speak"]);

export const SIT_PRETTY_CLIP = "Sitting_loop_2";

export const ONE_SHOT_DOG_ACTIONS = new Set(
  Object.values(DOG_ANIMATION_REGISTRY)
    .filter((entry) => !entry.loop)
    .map((entry) => entry.action)
);

const FEEDING_ACTION_KEYS = new Set([
  "eat",
  "eating",
  "feed",
  "feeding",
  "feedquick",
  "food",
  "treat",
]);

const warnedMissingDogAnimationClips = new Set();

function getRegistryEntry(requestedClip = "") {
  const raw = String(requestedClip || "").trim();
  if (!raw) return null;

  return DOG_ANIMATION_BY_KEY[normalizeClipName(raw)] || null;
}

function findFirstAvailable(candidates = [], actionNames = []) {
  return candidates.find((clip) => actionNames.includes(clip)) || null;
}

function warnMissingDogAnimationClip(requestedClip, fallbackClip, actionNames) {
  const requested = String(requestedClip || "").trim();
  if (!requested || warnedMissingDogAnimationClips.has(requested)) return;

  warnedMissingDogAnimationClips.add(requested);
  console.warn(
    `[Doggerz 3D] Missing dog animation clip "${requested}". ` +
      `Falling back to "${fallbackClip}".`,
    { availableAnimations: actionNames }
  );
}

export function listDogAnimations({
  includeRaw = true,
  includeUnpolished = true,
  category = "",
} = {}) {
  return Object.values(DOG_ANIMATION_REGISTRY)
    .filter((entry) => includeRaw || !entry.action.startsWith("raw:"))
    .filter((entry) => includeUnpolished || entry.polished)
    .filter((entry) => !category || entry.category === category)
    .sort((a, b) => a.priority - b.priority || a.action.localeCompare(b.action));
}

export function hasDogAnimation(actionOrClip = "") {
  const raw = String(actionOrClip || "").trim();
  if (!raw) return false;

  return Boolean(getRegistryEntry(raw) || DOG_MODEL_CLIP_SET.has(raw));
}

export function resolveDogAnimation(action = "") {
  const entry = getRegistryEntry(action);
  if (entry) return entry.clip;

  const raw = String(action || "").trim();
  if (DOG_MODEL_CLIP_SET.has(raw)) return raw;

  return DEFAULT_DOG_ANIMATION_CLIP;
}

export function resolveDogModelClipRequest(requestedClip = "idle") {
  const raw = String(requestedClip || "idle").trim();
  if (!raw) return "idle";

  const entry = getRegistryEntry(raw);
  if (entry) return entry.action;
  if (DOG_MODEL_CLIP_SET.has(raw)) return `raw:${raw}`;

  return raw;
}

export function isFeedingDogAction(actionLike = "") {
  const key = normalizeClipName(actionLike);
  if (!key) return false;
  if (FEEDING_ACTION_KEYS.has(key)) return true;

  const entry = getRegistryEntry(actionLike);
  return entry?.category === "care" && entry.action !== "drink";
}

export function resolveFeedingClipName(phase = "loop", actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  if (phase === "start" && actionNames.includes(FEED_START_CLIP)) {
    return FEED_START_CLIP;
  }

  return (
    findFirstAvailable([FEED_LOOP_CLIP, "Eat_tear", FEED_START_CLIP], actionNames) ||
    findFirstAvailable([NEUTRAL_FEED_FALLBACK_CLIP], actionNames) ||
    actionNames[0] ||
    null
  );
}

export function hasPlayableDogModelClips(actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return false;

  return REQUIRED_DOG_MODEL_CLIPS.some((clip) => actionNames.includes(clip));
}

export function resolveClipName(requestedClip = "idle", actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  const raw = String(requestedClip || "idle").trim();
  if (actionNames.includes(raw)) return raw;

  const entry = getRegistryEntry(raw);
  if (entry) {
    return (
      findFirstAvailable(entry.fallbacks, actionNames) ||
      findFirstAvailable(CANONICAL_DOG_MODEL_CLIPS, actionNames)
    );
  }

  const fuzzyMatch = actionNames.find(
    (name) => normalizeClipName(name) === normalizeClipName(raw)
  );
  if (fuzzyMatch) return fuzzyMatch;

  return (
    findFirstAvailable(
      ["Idle_1", "Idle_2", "Idle_3", "Idle_5_loop"],
      actionNames
    ) ||
    actionNames[0] ||
    null
  );
}

export function resolveAvailableDogAnimation(
  requestedClip = "idle",
  actions = {},
  { warn = false } = {}
) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  const requested = String(requestedClip || DEFAULT_DOG_ANIMATION_CLIP).trim();
  const fallbackClip = actionNames.includes(DEFAULT_DOG_ANIMATION_CLIP)
    ? DEFAULT_DOG_ANIMATION_CLIP
    : actionNames[0];

  const resolvedClip = resolveClipName(requested, actions);
  if (resolvedClip && actionNames.includes(resolvedClip)) return resolvedClip;

  if (warn) {
    warnMissingDogAnimationClip(requested, fallbackClip, actionNames);
  }

  return fallbackClip;
}

export function getDogAnimationResolution(
  requestedClip = "idle",
  availableClipNames = RAW_DOG_MODEL_CLIPS
) {
  const actionNames = Array.isArray(availableClipNames)
    ? availableClipNames.filter(Boolean)
    : Object.keys(availableClipNames || {});
  const requested = String(requestedClip || DEFAULT_DOG_ANIMATION_CLIP).trim();
  const entry = getRegistryEntry(requested);
  const rawExists = DOG_MODEL_CLIP_SET.has(requested);
  const resolvedClip =
    resolveClipName(requested, Object.fromEntries(actionNames.map((name) => [name, true]))) ||
    DEFAULT_DOG_ANIMATION_CLIP;
  const exists = actionNames.includes(resolvedClip);
  const requiredMissing =
    entry?.fallbacks?.filter((clip) => !actionNames.includes(clip)) || [];

  return {
    requested,
    action: entry?.action || (rawExists ? `raw:${requested}` : requested),
    clip: resolvedClip,
    exists,
    source: entry ? (entry.action.startsWith("raw:") ? "raw" : "canonical") : rawExists ? "raw" : "fallback",
    category: entry?.category || inferCategory(resolvedClip),
    loop: entry?.loop ?? inferLoop(resolvedClip),
    fallback:
      resolvedClip !== requested && resolvedClip !== entry?.clip
        ? resolvedClip
        : null,
    missing: requiredMissing,
  };
}
