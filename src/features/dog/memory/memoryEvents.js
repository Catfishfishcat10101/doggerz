// src/features/dog/memory/memoryEvents.js
export const MEMORY_MOMENT_TYPES = Object.freeze({
  FIRST_LEVEL_UP: "first_level_up",
  FIRST_CARE_LOOP: "first_care_loop",
  TRICK_MASTERED: "trick_mastered",
  TREASURE_FOUND: "treasure_found",
  SLEPT_IN_DOGHOUSE: "slept_in_doghouse",
  MIDNIGHT_ZOOMIES: "midnight_zoomies",
});

const MEMORY_MOMENT_META = Object.freeze({
  [MEMORY_MOMENT_TYPES.FIRST_LEVEL_UP]: Object.freeze({
    durationMs: 3400,
    cooldownMs: 24 * 60 * 60 * 1000,
  }),
  [MEMORY_MOMENT_TYPES.FIRST_CARE_LOOP]: Object.freeze({
    durationMs: 3200,
    cooldownMs: 24 * 60 * 60 * 1000,
  }),
  [MEMORY_MOMENT_TYPES.TRICK_MASTERED]: Object.freeze({
    durationMs: 3400,
    cooldownMs: 60_000,
  }),
  [MEMORY_MOMENT_TYPES.TREASURE_FOUND]: Object.freeze({
    durationMs: 3200,
    cooldownMs: 45_000,
  }),
  [MEMORY_MOMENT_TYPES.SLEPT_IN_DOGHOUSE]: Object.freeze({
    durationMs: 3000,
    cooldownMs: 6 * 60 * 60 * 1000,
  }),
  [MEMORY_MOMENT_TYPES.MIDNIGHT_ZOOMIES]: Object.freeze({
    durationMs: 3200,
    cooldownMs: 2 * 60 * 60 * 1000,
  }),
});

function normalizeMomentType(type) {
  return String(type || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

export function getMemoryMomentMeta(type) {
  const key = normalizeMomentType(type);
  return (
    MEMORY_MOMENT_META[key] ||
    Object.freeze({ durationMs: 3200, cooldownMs: 120_000 })
  );
}

export function createMemoryMomentEvent(type, payload = {}) {
  const key = normalizeMomentType(type);
  if (!key) return null;
  const now = Date.now();
  const timestamp =
    Number(payload?.timestamp || payload?.occurredAt || now) || now;
  const uniqueKey =
    String(payload?.uniqueKey || "").trim() ||
    `${key}:${Math.max(0, Math.floor(timestamp / 1000))}`;

  return {
    id: `${key}:${timestamp}`,
    type: key,
    timestamp,
    uniqueKey,
    payload: payload && typeof payload === "object" ? { ...payload } : {},
    ...getMemoryMomentMeta(key),
  };
}

export function buildDoghouseSleepMomentKey(now = Date.now()) {
  const windowMs = 6 * 60 * 60 * 1000;
  const bucket = Math.max(0, Math.floor(Number(now || Date.now()) / windowMs));
  return `slept_in_doghouse:${bucket}`;
}
