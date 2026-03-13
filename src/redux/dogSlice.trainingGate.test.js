import { describe, expect, it } from "vitest";

import dogReducer, {
  goPotty,
  setAdoptedAt,
  tickDog,
  trainObedience,
} from "@/redux/dogSlice.js";

describe("dogSlice potty gate for tricks", () => {
  it("blocks trick training until potty training is complete", () => {
    const now = Date.now();
    const adopted = dogReducer(
      dogReducer(undefined, { type: "@@INIT" }),
      setAdoptedAt(now)
    );

    const next = dogReducer(
      adopted,
      trainObedience({
        now: now + 1,
        commandId: "sit",
        input: "button",
        success: true,
      })
    );

    expect(next.training.potty.completedAt).toBe(null);
    expect(next.lastAction).toBe("trainBlocked");
  });

  it("lets older untrained saves finish potty training before tricks unlock", () => {
    const now = Date.now();
    const adoptedAt = now - 20 * 24 * 60 * 60 * 1000;
    let state = dogReducer(
      dogReducer(undefined, { type: "@@INIT" }),
      setAdoptedAt(adoptedAt)
    );
    state = {
      ...state,
      level: 10,
      bond: {
        ...state.bond,
        value: 40,
      },
    };

    const goal = Number(state.training?.potty?.goal || 0);
    for (let i = 0; i < goal; i += 1) {
      state = dogReducer(
        state,
        goPotty({ now: now + i + 1, forceSuccess: true })
      );
    }

    expect(state.training.potty.completedAt).toBeTruthy();
    expect(state.training.obedience.unlockedIds).toContain("sit");
    expect(state.training.obedience.unlockedIds).toContain("speak");
    expect(state.training.obedience.unlockedIds).not.toContain("shake");
    expect(
      Object.keys(state.training.obedience.unlockableAtById || {})
    ).toEqual([]);

    const trained = dogReducer(
      state,
      trainObedience({
        now: now + goal + 10,
        commandId: "sit",
        input: "button",
        success: true,
      })
    );

    expect(trained.lastAction).not.toBe("trainBlocked");
  });

  it("keeps the active trick set to one or two commands at a time", () => {
    const now = Date.now();
    const adoptedAt = now - 20 * 24 * 60 * 60 * 1000;
    let state = dogReducer(
      dogReducer(undefined, { type: "@@INIT" }),
      setAdoptedAt(adoptedAt)
    );
    state = {
      ...state,
      level: 12,
      bond: {
        ...state.bond,
        value: 50,
      },
    };

    const goal = Number(state.training?.potty?.goal || 0);
    for (let i = 0; i < goal; i += 1) {
      state = dogReducer(
        state,
        goPotty({ now: now + i + 1, forceSuccess: true })
      );
    }

    expect(state.training.obedience.unlockedIds).toEqual(["sit", "speak"]);
    expect(
      Object.keys(state.training.obedience.unlockableAtById || {})
    ).toEqual([]);
  });

  it("opens the next trick after the current lesson is mastered", () => {
    const now = Date.now();
    const adoptedAt = now - 20 * 24 * 60 * 60 * 1000;
    let state = dogReducer(
      dogReducer(undefined, { type: "@@INIT" }),
      setAdoptedAt(adoptedAt)
    );
    state = {
      ...state,
      level: 12,
      bond: {
        ...state.bond,
        value: 50,
      },
    };

    const goal = Number(state.training?.potty?.goal || 0);
    for (let i = 0; i < goal; i += 1) {
      state = dogReducer(
        state,
        goPotty({ now: now + i + 1, forceSuccess: true })
      );
    }

    const pottyDoneAt = now + goal;
    state = {
      ...state,
      skills: {
        ...state.skills,
        obedience: {
          ...(state.skills?.obedience || {}),
          sit: {
            xp: 1000,
            level: 20,
          },
        },
      },
    };

    state = dogReducer(
      state,
      tickDog({
        now: pottyDoneAt + 1,
      })
    );

    expect(state.training.obedience.unlockedIds).not.toContain("shake");
    expect(state.training.obedience.unlockedIds).not.toContain("sitPretty");
  });
});
