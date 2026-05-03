// src/components/game/animatedEvents.js

export const ANIMATED_EVENTS = Object.freeze([
  {
    id: "butterfly",
    icon: "🦋",
    label: "Butterfly Chase",
    summary: "Dog notices movement, then chases briefly.",
    family: "day",
  },
  {
    id: "leaf_gust",
    icon: "🍃",
    label: "Leaf Gust",
    summary: "A wind burst sends leaves across the yard.",
    family: "day",
  },
  {
    id: "owl",
    icon: "🦉",
    label: "Owl Perch",
    summary: "Night watcher appears and catches attention.",
    family: "night",
  },
  {
    id: "comet",
    icon: "☄️",
    label: "Comet Flash",
    summary: "A fast sky streak lights the scene.",
    family: "night",
  },
  {
    id: "firefly_snap",
    icon: "✨",
    label: "Firefly Snap",
    summary: "Short reaction to nearby firefly glow.",
    family: "seasonal",
  },
  {
    id: "midnight_zoomies",
    icon: "💨",
    label: "Midnight Zoomies",
    summary: "Temporary movement burst during late-night play.",
    family: "night",
  },
]);

export const ANIMATED_EVENT_PHASES = Object.freeze({
  butterfly: Object.freeze([
    { id: "notice", durationMs: 420 },
    { id: "chase", durationMs: 3600 },
    { id: "settle", durationMs: 520 },
  ]),
  leaf_gust: Object.freeze([
    { id: "gust", durationMs: 4200 },
    { id: "settle", durationMs: 700 },
  ]),
  owl: Object.freeze([
    { id: "perch", durationMs: 9800 },
    { id: "settle", durationMs: 400 },
  ]),
  comet: Object.freeze([
    { id: "streak", durationMs: 3600 },
    { id: "settle", durationMs: 500 },
  ]),
  firefly_snap: Object.freeze([
    { id: "glow", durationMs: 900 },
    { id: "snap", durationMs: 450 },
    { id: "settle", durationMs: 400 },
  ]),
  midnight_zoomies: Object.freeze([
    { id: "burst", durationMs: 1800 },
    { id: "loop", durationMs: 2200 },
    { id: "settle", durationMs: 600 },
  ]),
});

export const ANIMATED_EVENT_DISTANCE_THRESHOLD = Object.freeze({
  butterfly: 0.18,
  leaf_gust: 0.24,
  owl: 0.2,
  comet: 0.22,
});

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function distanceNorm(from, to) {
  const fx = Number(from?.xNorm ?? 0.5);
  const fy = Number(from?.yNorm ?? 0.74);
  const tx = Number(to?.xNorm ?? 0.5);
  const ty = Number(to?.yNorm ?? 0.74);
  return Math.hypot(fx - tx, fy - ty);
}

export function createAnimatedEventRoute(type, now = Date.now(), options = {}) {
  const eventType = String(type || "")
    .trim()
    .toLowerCase();
  const phaseList = ANIMATED_EVENT_PHASES[eventType];
  if (!Array.isArray(phaseList) || !phaseList.length) return null;

  const first = phaseList[0];
  const startedAt = Number(now || Date.now());
  const anchor = {
    xNorm: clamp(options?.xNorm ?? 0.5, 0.05, 0.95),
    yNorm: clamp(options?.yNorm ?? 0.74, 0.05, 0.95),
  };
  return {
    id: startedAt,
    type: eventType,
    phase: first.id,
    phaseIndex: 0,
    phaseStartedAt: startedAt,
    phaseEndsAt: startedAt + Number(first.durationMs || 500),
    createdAt: startedAt,
    anchor,
    done: false,
  };
}

export function stepAnimatedEventRoute(route, now = Date.now()) {
  if (!route || route.done) return route;

  const eventType = String(route.type || "");
  const phaseList = ANIMATED_EVENT_PHASES[eventType] || [];
  const currentIndex = Math.max(0, Number(route.phaseIndex || 0));
  const current = phaseList[currentIndex];
  if (!current) return { ...route, done: true };

  if (Number(now || Date.now()) < Number(route.phaseEndsAt || 0)) return route;

  const nextIndex = currentIndex + 1;
  const next = phaseList[nextIndex];
  if (!next) {
    return { ...route, done: true };
  }

  const nextStart = Number(now || Date.now());
  return {
    ...route,
    phase: next.id,
    phaseIndex: nextIndex,
    phaseStartedAt: nextStart,
    phaseEndsAt: nextStart + Number(next.durationMs || 500),
    done: false,
  };
}

export function shouldResolveEventByDistance(route, dogPosNorm) {
  if (!route || route.done) return false;
  const eventType = String(route.type || "");
  const threshold = Number(ANIMATED_EVENT_DISTANCE_THRESHOLD[eventType] || 0);
  if (!threshold) return false;
  return distanceNorm(dogPosNorm, route.anchor) <= threshold;
}

export function getAnimatedEventMeta(eventType) {
  const key = String(eventType || "")
    .trim()
    .toLowerCase();
  return ANIMATED_EVENTS.find((event) => event.id === key) || null;
}

export function rollAmbientAnimatedEvent({ night = false } = {}) {
  const pool = night ? ["owl", "comet"] : ["butterfly", "leaf_gust"];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] || (night ? "owl" : "butterfly");
}
