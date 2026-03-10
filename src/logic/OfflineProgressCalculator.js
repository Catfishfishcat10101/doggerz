const MS_PER_HOUR = 1000 * 60 * 60;

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
