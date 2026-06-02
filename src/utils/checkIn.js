const HOUR_MS = 60 * 60 * 1000;

export const CHECK_IN_THRESHOLDS = Object.freeze({
  softMs: 6 * HOUR_MS,
  hungryMs: 6 * HOUR_MS,
  watchMs: 12 * HOUR_MS,
  strayMs: 18 * HOUR_MS,
  highMs: 24 * HOUR_MS,
  criticalMs: 48 * HOUR_MS,
});

export function getCheckInTier(lastSeenAt, now = Date.now()) {
  const last = Number(lastSeenAt || 0);
  if (!Number.isFinite(last) || last <= 0) {
    return { tier: "ok", hoursAway: 0 };
  }

  const hoursAway = Math.max(0, (Number(now) - last) / HOUR_MS);
  if (hoursAway * HOUR_MS >= CHECK_IN_THRESHOLDS.criticalMs) {
    return { tier: "critical", hoursAway };
  }
  if (hoursAway * HOUR_MS >= CHECK_IN_THRESHOLDS.highMs) {
    return { tier: "high", hoursAway };
  }
  if (hoursAway * HOUR_MS >= CHECK_IN_THRESHOLDS.watchMs) {
    return { tier: "watch", hoursAway };
  }
  if (hoursAway * HOUR_MS >= CHECK_IN_THRESHOLDS.softMs) {
    return { tier: "soft", hoursAway };
  }
  return { tier: "ok", hoursAway };
}
