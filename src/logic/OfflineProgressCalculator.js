const MS_PER_HOUR = 1000 * 60 * 60;
export const HUNGER_FULLNESS_BUFFER_HOURS = 4;
export const HUNGER_INCREASE_PER_HOUR = 10;
export const RUNAWAY_ABSENCE_THRESHOLD_HOURS = 72;
export const RUNAWAY_LOCKOUT_HOURS = 24;

export function getOfflineProgressHours(
  lastUpdatedAt,
  now = Date.now(),
  maxHours = 72
) {
  const savedAt = Number(lastUpdatedAt);
  const current = Number(now);
  if (!Number.isFinite(savedAt) || !Number.isFinite(current)) return 0;

  const rawHours = Math.max(0, (current - savedAt) / MS_PER_HOUR);
  return Math.min(Math.max(0, Number(maxHours) || 0), rawHours);
}

export function hasOfflineProgressGap(lastUpdatedAt, now = Date.now()) {
  return (
    getOfflineProgressHours(lastUpdatedAt, now, Number.POSITIVE_INFINITY) > 0
  );
}

export function getElapsedHoursAfterGrace(
  startAt,
  now = Date.now(),
  graceHours = 0,
  maxHours = Number.POSITIVE_INFINITY
) {
  const started = Number(startAt);
  const current = Number(now);
  if (!Number.isFinite(started) || !Number.isFinite(current)) return 0;

  const graceMs = Math.max(0, Number(graceHours) || 0) * MS_PER_HOUR;
  const rawHours = Math.max(0, current - (started + graceMs)) / MS_PER_HOUR;
  return Math.min(Math.max(0, Number(maxHours) || 0), rawHours);
}

export function calculateHunger(lastFedTimestamp, now = Date.now()) {
  const decayHours = getElapsedHoursAfterGrace(
    lastFedTimestamp,
    now,
    HUNGER_FULLNESS_BUFFER_HOURS
  );
  const hungerIncrease = decayHours * HUNGER_INCREASE_PER_HOUR;
  return Math.min(100, Math.floor(Math.max(0, hungerIncrease)));
}

export function shouldTriggerRunawayStrike(
  lastCheckInAt,
  now = Date.now(),
  absenceThresholdHours = RUNAWAY_ABSENCE_THRESHOLD_HOURS
) {
  return (
    getOfflineProgressHours(lastCheckInAt, now, Number.POSITIVE_INFINITY) >=
    Math.max(0, Number(absenceThresholdHours) || 0)
  );
}

export function createRunawayEndTimestamp(
  now = Date.now(),
  lockoutHours = RUNAWAY_LOCKOUT_HOURS
) {
  const current = Number(now);
  if (!Number.isFinite(current)) return null;
  return current + Math.max(0, Number(lockoutHours) || 0) * MS_PER_HOUR;
}

export function isDogAwayOnStrike(runawayEndTimestamp, now = Date.now()) {
  const endAt = Number(runawayEndTimestamp);
  const current = Number(now);
  if (!Number.isFinite(endAt) || !Number.isFinite(current)) return false;
  return endAt > current;
}

export function getRunawayStrikeState({
  lastCheckInAt,
  runawayEndTimestamp,
  lastRunawayTriggeredAt,
  now = Date.now(),
  absenceThresholdHours = RUNAWAY_ABSENCE_THRESHOLD_HOURS,
  lockoutHours = RUNAWAY_LOCKOUT_HOURS,
} = {}) {
  const current = Number(now);
  const hoursAway = getOfflineProgressHours(
    lastCheckInAt,
    current,
    Number.POSITIVE_INFINITY
  );
  const isAway = isDogAwayOnStrike(runawayEndTimestamp, current);
  const triggerRecordedAt = Number(lastRunawayTriggeredAt);
  const hasRecordedTrigger =
    Number.isFinite(triggerRecordedAt) &&
    triggerRecordedAt >= Number(lastCheckInAt || 0);
  const shouldTrigger =
    !isAway &&
    !hasRecordedTrigger &&
    shouldTriggerRunawayStrike(lastCheckInAt, current, absenceThresholdHours);
  const effectiveRunawayEndTimestamp = shouldTrigger
    ? createRunawayEndTimestamp(current, lockoutHours)
    : Number.isFinite(Number(runawayEndTimestamp))
      ? Number(runawayEndTimestamp)
      : null;

  return {
    hoursAway,
    isAway,
    hasRecordedTrigger,
    hasPendingReturn: Number.isFinite(Number(effectiveRunawayEndTimestamp)),
    shouldTrigger,
    runawayEndTimestamp: effectiveRunawayEndTimestamp,
    remainingMs: Math.max(
      0,
      Number(effectiveRunawayEndTimestamp || 0) - current
    ),
  };
}
