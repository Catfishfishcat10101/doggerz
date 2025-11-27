// src/utils/rewardedAdUtils.js
// Doggerz: Utility for tracking daily rewarded ad types per user.
// Usage:
//   - recordAdReward("coin") after a coin ad completes
//   - canClaimMysteryGift() before showing mystery gift option
//   - recordAdReward("mystery") after mystery gift is claimed
// @ts-nocheck

const REWARD_KEY = "doggerz:adRewards";
const MAX_DAYS_TO_KEEP = 14;

/**
 * Guard for environments without window/localStorage (tests, SSR).
 */
function getStorage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Returns today's date as an ISO string (YYYY-MM-DD).
 * @returns {string}
 */
export function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Gets the ad reward state from localStorage.
 * Shape:
 * {
 *   "2025-11-24": ["coin", "mystery"],
 *   "2025-11-23": ["coin"]
 * }
 * @returns {Record<string, string[]>}
 */
export function getAdRewardState() {
  const storage = getStorage();
  if (!storage) return {};

  const raw = storage.getItem(REWARD_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Sets the ad reward state in localStorage.
 * @param {Record<string, string[]>} state
 */
export function setAdRewardState(state) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(REWARD_KEY, JSON.stringify(state || {}));
  } catch {
    // Silently ignore quota / private mode errors
  }
}

/**
 * Prunes old days so localStorage doesn't grow forever.
 * Keeps last MAX_DAYS_TO_KEEP days.
 */
function pruneOldDays(state) {
  const entries = Object.entries(state || {});
  if (entries.length <= MAX_DAYS_TO_KEEP) return state;

  const sorted = entries.sort(([a], [b]) => (a < b ? 1 : -1)); // newest first
  const trimmed = sorted.slice(0, MAX_DAYS_TO_KEEP);
  return Object.fromEntries(trimmed);
}

/**
 * Records a rewarded ad type for today.
 * Example types:
 *   - "coin"    → user watched coin ad
 *   - "mystery" → user claimed mystery gift
 * @param {string} type
 */
export function recordAdReward(type) {
  if (!type) return;

  const state = getAdRewardState();
  const today = getTodayISO();

  if (!state[today]) state[today] = [];
  if (!state[today].includes(type)) {
    state[today].push(type);
  }

  const pruned = pruneOldDays(state);
  setAdRewardState(pruned);
}

/**
 * Returns true if the user can claim the mystery gift today.
 *
 * Rules:
 *  - Must have watched at least one "coin" ad today.
 *  - Must NOT have already claimed the "mystery" reward today.
 *
 * @returns {boolean}
 */
export function canClaimMysteryGift() {
  const state = getAdRewardState();
  const today = getTodayISO();
  const types = state[today] || [];

  const watchedCoin = types.includes("coin");
  const alreadyClaimedMystery = types.includes("mystery");

  return watchedCoin && !alreadyClaimedMystery;
}

/**
 * Optional helper: check if a specific reward type was recorded today.
 * @param {string} type
 * @returns {boolean}
 */
export function hasClaimedRewardToday(type) {
  if (!type) return false;
  const state = getAdRewardState();
  const today = getTodayISO();
  return !!state[today]?.includes(type);
}
