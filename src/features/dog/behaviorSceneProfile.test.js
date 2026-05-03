import { describe, expect, it, vi } from "vitest";

import {
  deriveBehaviorSceneProfile,
  getMorningGloryLiveOp,
  GHOST_BASE_OPACITY,
} from "@/features/dog/behaviorSceneProfile.js";

describe("behaviorSceneProfile", () => {
  it("activates the morning glory treat only from 6am to 8am local time", () => {
    expect(getMorningGloryLiveOp(new Date("2026-04-21T05:59:00")).active).toBe(
      false
    );
    expect(getMorningGloryLiveOp(new Date("2026-04-21T06:00:00")).active).toBe(
      true
    );
    expect(getMorningGloryLiveOp(new Date("2026-04-21T07:59:00")).active).toBe(
      true
    );
    expect(getMorningGloryLiveOp(new Date("2026-04-21T08:00:00")).active).toBe(
      false
    );
  });

  it("marks paw on glass eligibility only for very high trust, enough energy, and long idle time", () => {
    const now = new Date("2026-04-21T07:15:00").getTime();
    const profile = deriveBehaviorSceneProfile({
      now,
      weatherKey: "clear",
      vitals: { energy: 62, bondValue: 96 },
      life: { stage: "ADULT", ageDays: 88 },
      dog: {
        memory: { lastSeenAt: now - 61_000 },
        personalityProfile: {
          trust: { score: 96, focusMode: "user_focused" },
          dynamicStates: { frustration: 8, confidence: 88, affection: 72 },
          learnedTraits: { reliability: 84, houseManners: 78 },
          stressSignals: {},
          instinctEngine: {},
          bigFive: {},
        },
      },
    });

    expect(profile.trust.pawOnGlassEligible).toBe(true);
    expect(profile.trust.label).toBe("Paw on glass");
  });

  it("fades ghost visibility after a bark at the memory spot", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T21:00:02"));

    const ghostAt = new Date("2026-04-21T21:00:00").getTime();
    const profile = deriveBehaviorSceneProfile({
      weatherKey: "clear",
      vitals: { energy: 50, bondValue: 82 },
      life: { stage: "ADULT", ageDays: 160 },
      dog: {
        memorial: { completedAt: ghostAt - 1000 },
        legacyJourney: {
          ghostDogUnlocked: true,
          ghostMimicAction: "bark",
          ghostMimicAt: ghostAt,
        },
        personalityProfile: {
          trust: { score: 82 },
          dynamicStates: { frustration: 12, confidence: 74, affection: 65 },
        },
      },
    });

    expect(profile.ghost.present).toBe(true);
    expect(profile.ghost.opacity).toBeLessThan(GHOST_BASE_OPACITY);
    expect(profile.ghost.opacity).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});
