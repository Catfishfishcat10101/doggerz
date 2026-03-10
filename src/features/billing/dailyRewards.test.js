import { describe, expect, it } from "vitest";

import { getDailyRewardState } from "@/features/billing/dailyRewards.js";

describe("getDailyRewardState", () => {
  it("keeps a streak across the local DST spring-forward boundary", () => {
    const state = getDailyRewardState({
      lastRewardClaimedAt: new Date(2026, 2, 7, 12, 0, 0, 0).getTime(),
      consecutiveDays: 3,
      now: new Date(2026, 2, 8, 12, 0, 0, 0).getTime(),
    });

    expect(state.claimedToday).toBe(false);
    expect(state.canClaim).toBe(true);
    expect(state.diffDays).toBe(1);
    expect(state.nextStreakDay).toBe(4);
    expect(state.reward?.day).toBe(4);
  });

  it("does not block rewards when the last claim timestamp is in the future", () => {
    const now = new Date(2026, 2, 10, 9, 0, 0, 0).getTime();
    const futureClaim = new Date(2026, 2, 11, 9, 0, 0, 0).getTime();

    const state = getDailyRewardState({
      lastRewardClaimedAt: futureClaim,
      consecutiveDays: 6,
      now,
    });

    expect(state.claimedToday).toBe(false);
    expect(state.canClaim).toBe(true);
    expect(state.diffDays).toBe(Number.POSITIVE_INFINITY);
    expect(state.nextStreakDay).toBe(1);
    expect(state.reward?.day).toBe(1);
    expect(state.nextEligibleAt).toBe(now);
  });
});
