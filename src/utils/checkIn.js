// src/utils/checkIn.js

export const CHECK_IN_THRESHOLDS = {
  hungryMs: 4 * 60 * 60 * 1000,
  dirtyMs: 12 * 60 * 60 * 1000,
  strayMs: 24 * 60 * 60 * 1000,
};

export function getHoursAway(lastSeenAt, now = Date.now()) {
  const last = Number(lastSeenAt || 0);
  if (!Number.isFinite(last) || last <= 0) return 0;
  return Math.max(0, (now - last) / (1000 * 60 * 60));
}

export function getCheckInTier(lastSeenAt, now = Date.now()) {
  const last = Number(lastSeenAt || 0);
  if (!Number.isFinite(last) || last <= 0) {
    return { tier: "ok", hoursAway: 0, elapsedMs: 0 };
  }

  const elapsedMs = Math.max(0, now - last);
  const hoursAway = getHoursAway(last, now);

  if (elapsedMs >= CHECK_IN_THRESHOLDS.strayMs) {
    return { tier: "stray", hoursAway, elapsedMs };
  }
  if (elapsedMs >= CHECK_IN_THRESHOLDS.dirtyMs) {
    return { tier: "tired", hoursAway, elapsedMs };
  }
  if (elapsedMs >= CHECK_IN_THRESHOLDS.hungryMs) {
    return { tier: "hungry", hoursAway, elapsedMs };
  }
  return { tier: "ok", hoursAway, elapsedMs };
}

export function resolveConditionPrefix(tier) {
  if (tier === "stray") return "stray_";
  if (tier === "tired") return "tired_";
  return "";
}
