// src/animation/dogAnimationMap.js

export const DOG_ANIMATIONS = Object.freeze({
  idle: "idle",
  walk: "walk",
  walk_left: "walk_left",
  walk_right: "walk_right",
  turn_walk_left: "turn_walk_left",
  turn_walk_right: "turn_walk_right",
  bark: "bark",
  scratch: "scratch",
  sleep: "sleep",
  sit: "sit",
  wag: "wag",
  eat: "eat",
  lay_down: "lay_down",
  jump: "jump",
  fetch: "fetch",
  beg: "beg",
  paw: "paw",
  shake: "shake",
  highfive: "highfive",
  dance: "dance",
  gate_watch: "gate_watch",
  idle_resting: "idle_resting",
  light_sleep: "light_sleep",
  deep_rem_sleep: "deep_rem_sleep",
  drink: "drink",
  sniff: "sniff",
  lethargic_lay: "lethargic_lay",
});

export const DOG_ANIMATION_ALIASES = Object.freeze({
  running: DOG_ANIMATIONS.walk,
  walking: DOG_ANIMATIONS.walk,
  chase: DOG_ANIMATIONS.walk,
  chasing: DOG_ANIMATIONS.walk,
  wander: DOG_ANIMATIONS.walk,
  exploring: DOG_ANIMATIONS.walk,
  dig: DOG_ANIMATIONS.scratch,
  digging: DOG_ANIMATIONS.scratch,

  speak: DOG_ANIMATIONS.bark,
  high_five: DOG_ANIMATIONS.highfive,
  sit_pretty: DOG_ANIMATIONS.beg,
  sitpretty: DOG_ANIMATIONS.beg,
  roll: DOG_ANIMATIONS.lay_down,
  rollover: DOG_ANIMATIONS.lay_down,
  roll_over: DOG_ANIMATIONS.lay_down,
  spin: DOG_ANIMATIONS.walk,
  bow: DOG_ANIMATIONS.beg,
  play_dead: DOG_ANIMATIONS.lay_down,
  playdead: DOG_ANIMATIONS.lay_down,
  wave: DOG_ANIMATIONS.paw,
  crawl: DOG_ANIMATIONS.walk,
  stay: DOG_ANIMATIONS.sit,
  backflip: DOG_ANIMATIONS.jump,
  trick: DOG_ANIMATIONS.sit,

  ok: DOG_ANIMATIONS.idle,
  calm: DOG_ANIMATIONS.idle,
  content: DOG_ANIMATIONS.idle,
  happy: DOG_ANIMATIONS.wag,
  excited: DOG_ANIMATIONS.walk,
  restless: DOG_ANIMATIONS.walk,
  hungry: DOG_ANIMATIONS.beg,
  sleepy: DOG_ANIMATIONS.light_sleep,
  tired: DOG_ANIMATIONS.light_sleep,
  dirty: DOG_ANIMATIONS.scratch,
  sad: DOG_ANIMATIONS.idle_resting,
  stressed: DOG_ANIMATIONS.idle_resting,
  fragile: DOG_ANIMATIONS.lethargic_lay,

  feed: DOG_ANIMATIONS.eat,
  feed_premium_empty: DOG_ANIMATIONS.sniff,
  feed_premium_cooldown: DOG_ANIMATIONS.sniff,
  feed_rejected_hard: DOG_ANIMATIONS.sniff,
  sniff_kibble_reject: DOG_ANIMATIONS.sniff,
  water: DOG_ANIMATIONS.drink,
  play: DOG_ANIMATIONS.walk,
  pet: DOG_ANIMATIONS.wag,
  pet_cuddle: DOG_ANIMATIONS.wag,
  pet_side_eye: DOG_ANIMATIONS.idle,
  pet_doze_off: DOG_ANIMATIONS.light_sleep,
  rest: DOG_ANIMATIONS.idle_resting,
  nap: DOG_ANIMATIONS.light_sleep,
  bathe: DOG_ANIMATIONS.shake,
  potty: DOG_ANIMATIONS.sniff,
  potty_fakeout: DOG_ANIMATIONS.sniff,
  wake: DOG_ANIMATIONS.idle,
  sleep_auto: DOG_ANIMATIONS.light_sleep,
  dream_woof: DOG_ANIMATIONS.deep_rem_sleep,

  train: DOG_ANIMATIONS.sit,
  train_perfect: DOG_ANIMATIONS.sit,
  train_doze_off: DOG_ANIMATIONS.light_sleep,
  train_ignore: DOG_ANIMATIONS.idle,
  train_reinterpret: DOG_ANIMATIONS.sit,
  trainblocked: DOG_ANIMATIONS.sit,
  trainfailed: DOG_ANIMATIONS.sit,
  trainlocked: DOG_ANIMATIONS.sit,
  train_blocked: DOG_ANIMATIONS.sit,
  train_failed: DOG_ANIMATIONS.sit,
  train_locked: DOG_ANIMATIONS.sit,
  train_zoomies: DOG_ANIMATIONS.walk,
  zoomies: DOG_ANIMATIONS.walk,
  pet_zoomies: DOG_ANIMATIONS.walk,

  button_heist: DOG_ANIMATIONS.fetch,
  surprise_cleanup: DOG_ANIMATIONS.sit,
  surprise_fetch_cleanup: DOG_ANIMATIONS.fetch,
  surprise_fetch_recover: DOG_ANIMATIONS.fetch,
  guilty_paws: DOG_ANIMATIONS.paw,
  accident: DOG_ANIMATIONS.idle_resting,
  table_theft: DOG_ANIMATIONS.fetch,
  destructive_chewing: DOG_ANIMATIONS.fetch,
  equip_toy: DOG_ANIMATIONS.wag,
  treasure_found: DOG_ANIMATIONS.sniff,
  session_start: DOG_ANIMATIONS.idle,

  rescued: DOG_ANIMATIONS.idle_resting,
  farewell: DOG_ANIMATIONS.idle_resting,
  runaway_strike: DOG_ANIMATIONS.walk,
  runaway_returned: DOG_ANIMATIONS.walk,
  vacation_on: DOG_ANIMATIONS.idle_resting,
  vacation_off: DOG_ANIMATIONS.wag,
});

export const DEFAULT_DOG_ANIMATION = DOG_ANIMATIONS.idle;

export function normalizeDogAnimationKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function resolveDogAnimation(value) {
  const key = normalizeDogAnimationKey(value);
  if (!key) return DEFAULT_DOG_ANIMATION;
  if (DOG_ANIMATIONS[key]) return DOG_ANIMATIONS[key];
  if (DOG_ANIMATION_ALIASES[key]) return DOG_ANIMATION_ALIASES[key];
  return DEFAULT_DOG_ANIMATION;
}

export function isCanonicalDogAnimation(value) {
  const key = normalizeDogAnimationKey(value);
  return Boolean(DOG_ANIMATIONS[key]);
}

export function isKnownDogAnimation(value) {
  const key = normalizeDogAnimationKey(value);
  return Boolean(DOG_ANIMATIONS[key] || DOG_ANIMATION_ALIASES[key]);
}
