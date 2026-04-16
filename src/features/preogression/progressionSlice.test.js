import { describe, expect, it } from "vitest";

import progressionReducer, {
  createInitialProgressionState,
  recordProgressionEvent,
} from "@/features/preogression/progressionSlice.js";
import { PROGRESSION_EVENT_TYPES } from "@/features/preogression/progressionConfig.js";

function buildSnapshot({
  successCount = 0,
  goal = 5,
  completedAt = null,
  obedience = [],
  stage = "PUPPY",
  ageDays = 4,
} = {}) {
  return {
    occurredAt: 1_000,
    dayKey: "2026-04-11",
    dog: {
      id: "dog-1",
      name: "Fireball",
      adoptedAt: 1,
      level: 2,
      bondValue: 18,
      stage,
      ageDays,
      potty: {
        successCount,
        goal,
        completedAt,
      },
      obedience,
    },
    user: {
      id: "user-1",
      displayName: "Tester",
      streakDays: 1,
    },
  };
}

describe("progressionSlice potty-first flow", () => {
  it("starts with potty as the only active training track", () => {
    const state = createInitialProgressionState();

    expect(state.training.activeTrackIds).toEqual(["potty"]);
    expect(state.training.tracks.potty.phase).toBe("introduced");
    expect(state.training.tracks.sit.phase).toBe("locked");
  });

  it("does not unlock obedience until potty training is mastered", () => {
    let state = progressionReducer(
      undefined,
      recordProgressionEvent({
        type: PROGRESSION_EVENT_TYPES.POTTY_SUCCESS,
        occurredAt: 2_000,
        snapshot: buildSnapshot({ successCount: 3, goal: 5 }),
      })
    );

    expect(state.training.tracks.potty.phase).toBe("reliable");
    expect(state.unlocks.features).not.toContain("obedience_training");

    state = progressionReducer(
      state,
      recordProgressionEvent({
        type: PROGRESSION_EVENT_TYPES.POTTY_SUCCESS,
        occurredAt: 3_000,
        snapshot: buildSnapshot({
          successCount: 5,
          goal: 5,
          completedAt: 3_000,
        }),
      })
    );

    expect(state.training.tracks.potty.phase).toBe("mastered");
    expect(state.unlocks.features).toContain("obedience_training");
    expect(
      state.milestoneQueue.some(
        (entry) => entry.id === "unlock:obedience_training"
      )
    ).toBe(true);
  });

  it("records reliable command progress after potty mastery", () => {
    const masteredPottyState = progressionReducer(
      undefined,
      recordProgressionEvent({
        type: PROGRESSION_EVENT_TYPES.POTTY_SUCCESS,
        occurredAt: 3_000,
        snapshot: buildSnapshot({
          successCount: 5,
          goal: 5,
          completedAt: 3_000,
        }),
      })
    );

    const nextState = progressionReducer(
      masteredPottyState,
      recordProgressionEvent({
        type: PROGRESSION_EVENT_TYPES.TRAINING_SESSION,
        occurredAt: 4_000,
        snapshot: buildSnapshot({
          successCount: 5,
          goal: 5,
          completedAt: 3_000,
          obedience: [
            {
              id: "sit",
              label: "Sit",
              unlocked: true,
              masteryPct: 74,
            },
          ],
        }),
        payload: {
          commandId: "sit",
          outcome: "success",
        },
      })
    );

    expect(nextState.training.tracks.sit.phase).toBe("reliable");
    expect(nextState.training.reliableCommandCount).toBe(1);
    expect(
      nextState.memories.some((memory) => memory.id === "first_shared_language")
    ).toBe(true);
  });
});
