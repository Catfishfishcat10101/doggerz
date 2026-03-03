/** @format */

export const DAILY_REWARD_DAY_MS = 24 * 60 * 60 * 1000;

export const DAILY_REWARD_SCHEDULE = Object.freeze([
  { day: 1, type: "COINS", value: 100, label: "100 Coins" },
  { day: 2, type: "ENERGY", value: 20, label: "+20 Energy" },
  { day: 3, type: "COINS", value: 150, label: "150 Coins" },
  { day: 4, type: "ENERGY", value: 25, label: "+25 Energy" },
  { day: 5, type: "COINS", value: 250, label: "250 Coins" },
  { day: 6, type: "ENERGY", value: 30, label: "+30 Energy" },
  { day: 7, type: "COINS", value: 500, label: "500 Coins (Weekly Bonus)" },
]);

function startOfLocalDayMs(ts) {
  const d = new Date(Number(ts) || Date.now());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getRewardByStreakDay(streakDay) {
  const total = DAILY_REWARD_SCHEDULE.length;
  if (!total) return null;
  const idx = ((Math.max(1, Math.floor(streakDay)) - 1) % total) + 1;
  return DAILY_REWARD_SCHEDULE[idx - 1] || null;
}

export function getDailyRewardState({
  lastRewardClaimedAt,
  consecutiveDays,
  now = Date.now(),
}) {
  const todayMs = startOfLocalDayMs(now);
  const lastClaimMs = Number(lastRewardClaimedAt || 0);
  const lastClaimDayMs = lastClaimMs ? startOfLocalDayMs(lastClaimMs) : 0;
  const priorStreak = Math.max(0, Math.floor(Number(consecutiveDays) || 0));

  const diffDays = lastClaimDayMs
    ? Math.floor((todayMs - lastClaimDayMs) / DAILY_REWARD_DAY_MS)
    : Number.POSITIVE_INFINITY;

  const claimedToday = lastClaimDayMs ? diffDays <= 0 : false;
  const canClaim = !claimedToday;
  const nextStreakDay = claimedToday
    ? Math.max(1, priorStreak)
    : diffDays === 1
      ? priorStreak + 1
      : 1;
  const reward = getRewardByStreakDay(nextStreakDay);
  const nextEligibleAt =
    canClaim && !claimedToday ? todayMs : todayMs + DAILY_REWARD_DAY_MS;

  return {
    canClaim,
    claimedToday,
    diffDays,
    priorStreak,
    nextStreakDay,
    reward,
    nextEligibleAt,
    todayMs,
  };
}
