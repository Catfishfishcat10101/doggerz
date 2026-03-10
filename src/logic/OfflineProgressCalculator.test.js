import { describe, expect, it } from "vitest";

import {
  createRunawayEndTimestamp,
  getRunawayStrikeState,
  isDogAwayOnStrike,
  RUNAWAY_ABSENCE_THRESHOLD_HOURS,
  RUNAWAY_LOCKOUT_HOURS,
  shouldTriggerRunawayStrike,
} from "@/logic/OfflineProgressCalculator.js";

const MS_PER_HOUR = 1000 * 60 * 60;

describe("OfflineProgressCalculator runaway strike helpers", () => {
  it("triggers a strike after the absence threshold", () => {
    const now = Date.UTC(2026, 2, 10, 18, 0, 0);
    const lastCheckInAt = now - RUNAWAY_ABSENCE_THRESHOLD_HOURS * MS_PER_HOUR;

    expect(shouldTriggerRunawayStrike(lastCheckInAt, now)).toBe(true);
  });

  it("does not trigger a strike before the absence threshold", () => {
    const now = Date.UTC(2026, 2, 10, 18, 0, 0);
    const lastCheckInAt =
      now - (RUNAWAY_ABSENCE_THRESHOLD_HOURS - 1) * MS_PER_HOUR;

    expect(shouldTriggerRunawayStrike(lastCheckInAt, now)).toBe(false);
  });

  it("detects when the dog is currently away on strike", () => {
    const now = Date.UTC(2026, 2, 10, 18, 0, 0);
    const runawayEndTimestamp = now + RUNAWAY_LOCKOUT_HOURS * MS_PER_HOUR;

    expect(isDogAwayOnStrike(runawayEndTimestamp, now)).toBe(true);
    expect(isDogAwayOnStrike(now - 1, now)).toBe(false);
  });

  it("builds a strike state with a 24 hour lockout window", () => {
    const now = Date.UTC(2026, 2, 10, 18, 0, 0);
    const lastCheckInAt = now - RUNAWAY_ABSENCE_THRESHOLD_HOURS * MS_PER_HOUR;

    const state = getRunawayStrikeState({
      lastCheckInAt,
      runawayEndTimestamp: null,
      now,
    });

    expect(state.shouldTrigger).toBe(true);
    expect(state.isAway).toBe(false);
    expect(state.runawayEndTimestamp).toBe(
      createRunawayEndTimestamp(now, RUNAWAY_LOCKOUT_HOURS)
    );
    expect(state.remainingMs).toBe(RUNAWAY_LOCKOUT_HOURS * MS_PER_HOUR);
  });

  it("does not retrigger while waiting for the player to welcome the dog back", () => {
    const now = Date.UTC(2026, 2, 10, 18, 0, 0);
    const lastCheckInAt = now - RUNAWAY_ABSENCE_THRESHOLD_HOURS * MS_PER_HOUR;
    const lastRunawayTriggeredAt = now - 2 * 60 * 60 * 1000;
    const runawayEndTimestamp = now - 1;

    const state = getRunawayStrikeState({
      lastCheckInAt,
      lastRunawayTriggeredAt,
      runawayEndTimestamp,
      now,
    });

    expect(state.shouldTrigger).toBe(false);
    expect(state.hasRecordedTrigger).toBe(true);
    expect(state.hasPendingReturn).toBe(true);
  });
});
