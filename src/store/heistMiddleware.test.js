import { beforeEach, describe, expect, it, vi } from "vitest";

describe("heistMiddleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("dispatches a route heist on eligible simulation ticks", async () => {
    const { heistMiddleware } =
      await import("@/store/middleware/heistMiddleware.js");
    const { simulationTick, triggerButtonHeist } =
      await import("@/store/dogSlice.js");

    vi.spyOn(Date, "now").mockReturnValue(120_000);
    vi.spyOn(Math, "random").mockReturnValueOnce(0.05).mockReturnValueOnce(0);

    const dispatched = [];
    const action = simulationTick({ now: 120_000 });
    const next = vi.fn((value) => value);
    const storeApi = {
      dispatch: (value) => dispatched.push(value),
      getState: () => ({
        dog: {
          adoptedAt: 1,
          lifecycleStatus: "ACTIVE",
          surprise: { active: null },
          isAsleep: false,
          aiState: "idle",
          name: "Fireball",
        },
      }),
    };

    const result = heistMiddleware(storeApi)(next)(action);

    expect(result).toBe(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe(triggerButtonHeist.type);
    expect(dispatched[0].payload).toMatchObject({
      now: 120_000,
      silenceMs: 60_000,
      stolenAction: "store",
    });
    expect(dispatched[0].payload.message).toBe(
      "Fireball ran off with the store key. Play fetch to get it back."
    );
  });
});
