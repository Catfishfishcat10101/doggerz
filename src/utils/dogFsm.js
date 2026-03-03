// src/utils/dogFsm.js

const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));

const normalizeAction = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

export const DOG_FSM_STATES = Object.freeze({
  IDLE: "idle",
  EATING: "eating",
  DRINKING: "drinking",
  PLAYING: "playing",
  BATHING: "bathing",
  POTTY: "potty",
  SCOOPING: "scooping",
  SLEEPING: "sleeping",
  ZOOMIES: "zoomies",
  DIGGING: "digging",
  TRAINING: "training",
});

export const DOG_FSM_DEFAULT = Object.freeze({
  state: DOG_FSM_STATES.IDLE,
  prev: null,
  startedAt: null,
  until: null,
  lockedUntil: null,
  reason: null,
  lastDecisionAt: null,
  nextDecisionAt: null,
});

const ACTION_TO_STATE = Object.freeze({
  feed: DOG_FSM_STATES.EATING,
  eat: DOG_FSM_STATES.EATING,
  water: DOG_FSM_STATES.DRINKING,
  drink: DOG_FSM_STATES.DRINKING,
  play: DOG_FSM_STATES.PLAYING,
  rest: DOG_FSM_STATES.SLEEPING,
  sleep: DOG_FSM_STATES.SLEEPING,
  bathe: DOG_FSM_STATES.BATHING,
  bath: DOG_FSM_STATES.BATHING,
  potty: DOG_FSM_STATES.POTTY,
  scoop: DOG_FSM_STATES.SCOOPING,
  pet: DOG_FSM_STATES.IDLE,
  train: DOG_FSM_STATES.TRAINING,
});

const STATE_DURATIONS_MS = Object.freeze({
  [DOG_FSM_STATES.EATING]: 2500,
  [DOG_FSM_STATES.DRINKING]: 2000,
  [DOG_FSM_STATES.PLAYING]: 3200,
  [DOG_FSM_STATES.BATHING]: 3600,
  [DOG_FSM_STATES.POTTY]: 2400,
  [DOG_FSM_STATES.SCOOPING]: 2000,
  [DOG_FSM_STATES.DIGGING]: 5500,
  [DOG_FSM_STATES.ZOOMIES]: 30000,
  [DOG_FSM_STATES.TRAINING]: 2200,
});

const STATE_ANIMS = Object.freeze({
  [DOG_FSM_STATES.EATING]: "eat",
  [DOG_FSM_STATES.DRINKING]: "wag",
  [DOG_FSM_STATES.PLAYING]: "walk",
  [DOG_FSM_STATES.BATHING]: "shake",
  [DOG_FSM_STATES.POTTY]: "walk",
  [DOG_FSM_STATES.SCOOPING]: "wag",
  [DOG_FSM_STATES.SLEEPING]: "sleep",
  [DOG_FSM_STATES.ZOOMIES]: "walk",
  [DOG_FSM_STATES.DIGGING]: "scratch",
  [DOG_FSM_STATES.TRAINING]: "trick",
});

const LOCKED_STATES = new Set([DOG_FSM_STATES.ZOOMIES]);

const AUTONOMY_COOLDOWN_MS = 90 * 1000;

export function ensureDogFsmState(dog) {
  if (!dog || typeof dog !== "object") return null;
  if (!dog.fsm || typeof dog.fsm !== "object") {
    dog.fsm = { ...DOG_FSM_DEFAULT };
    return dog.fsm;
  }

  const next = {
    ...DOG_FSM_DEFAULT,
    ...dog.fsm,
  };

  dog.fsm = next;
  return next;
}

export function getDogFsmAnimHint(dog) {
  const fsm = dog && typeof dog === "object" ? dog.fsm : null;
  if (!fsm || typeof fsm !== "object") return null;
  const state = normalizeAction(fsm.state);
  if (!state || state === DOG_FSM_STATES.IDLE) return null;
  return STATE_ANIMS[state] || null;
}

export function transitionDogFsm(dog, nextState, now, opts = {}) {
  const fsm = ensureDogFsmState(dog);
  if (!fsm) return null;

  const target = normalizeAction(nextState);
  if (!target) return fsm;
  if (fsm.state === target && !opts.force) return fsm;

  fsm.prev = fsm.state || null;
  fsm.state = target;
  fsm.startedAt = typeof now === "number" ? now : Date.now();

  const durationMs =
    typeof opts.durationMs === "number"
      ? opts.durationMs
      : STATE_DURATIONS_MS[target] || null;

  fsm.until = durationMs && durationMs > 0 ? fsm.startedAt + durationMs : null;

  if (opts.locked === true || LOCKED_STATES.has(target)) {
    fsm.lockedUntil = fsm.until || fsm.startedAt + 1000;
  } else if (opts.locked === false) {
    fsm.lockedUntil = null;
  }

  fsm.reason = opts.reason || fsm.reason || null;
  return fsm;
}

export function applyFsmAction(dog, actionKey, now, opts = {}) {
  const key = normalizeAction(actionKey);
  if (!key) return null;
  const next = ACTION_TO_STATE[key];
  if (!next) return null;
  return transitionDogFsm(dog, next, now, {
    reason: opts.reason || "action",
    durationMs: opts.durationMs,
    locked: opts.locked,
  });
}

export function isDogFsmLocked(dog, now = Date.now()) {
  const fsm = ensureDogFsmState(dog);
  if (!fsm) return false;
  if (!fsm.lockedUntil) return false;
  return now < fsm.lockedUntil;
}

export function advanceDogFsm(dog, now = Date.now(), opts = {}) {
  const fsm = ensureDogFsmState(dog);
  if (!fsm) return null;

  if (fsm.until && now >= fsm.until && fsm.state !== DOG_FSM_STATES.SLEEPING) {
    transitionDogFsm(dog, DOG_FSM_STATES.IDLE, now, { reason: "timeout" });
  }

  if (fsm.lockedUntil && now >= fsm.lockedUntil) {
    fsm.lockedUntil = null;
  }

  const energy = Number(dog?.stats?.energy ?? 0);
  const happiness = Number(dog?.stats?.happiness ?? 0);

  if (dog?.isAsleep || energy <= 10) {
    if (fsm.state !== DOG_FSM_STATES.SLEEPING) {
      transitionDogFsm(dog, DOG_FSM_STATES.SLEEPING, now, {
        reason: "energy",
      });
    }
    return fsm;
  }

  if (fsm.state === DOG_FSM_STATES.SLEEPING && !dog?.isAsleep) {
    transitionDogFsm(dog, DOG_FSM_STATES.IDLE, now, { reason: "wake" });
  }

  const allowAutonomy = opts?.allowAutonomy !== false;
  if (!allowAutonomy) return fsm;

  if (fsm.state !== DOG_FSM_STATES.IDLE) return fsm;

  const nextDecisionAt = Number(fsm.nextDecisionAt || 0);
  if (nextDecisionAt && now < nextDecisionAt) return fsm;

  const lastDecisionAt = Number(fsm.lastDecisionAt || 0);
  if (lastDecisionAt && now - lastDecisionAt < AUTONOMY_COOLDOWN_MS) return fsm;

  fsm.lastDecisionAt = now;

  if (happiness >= 70 && Math.random() < 0.2) {
    transitionDogFsm(dog, DOG_FSM_STATES.DIGGING, now, {
      reason: "playful",
    });
    dog.stats.cleanliness = clamp(dog.stats.cleanliness - 40, 0, 100);
    dog.lastAction = "digging";
    fsm.nextDecisionAt = now + 4 * 60 * 1000;
    return fsm;
  }

  fsm.nextDecisionAt = now + 2 * 60 * 1000;
  return fsm;
}
