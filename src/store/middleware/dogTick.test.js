import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("dogTickMiddleware", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-13T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts a heartbeat interval and dispatches dog world ticks", async () => {
    const {
      dogTickMiddleware,
      startDogTickEngine,
      stopDogTickEngine,
      DOG_ENGINE_TICK_INTERVAL_MS,
      DOG_ENGINE_TICK,
    } = await import("@/store/middleware/dogTick.js");
    const { tickDogPolls } = await import("@/store/dogSlice.js");

    const dispatched = [];
    const next = vi.fn((value) => value);
    const storeApi = {
      dispatch: (value) => dispatched.push(value),
      getState: () => ({}),
    };

    const invoke = dogTickMiddleware(storeApi)(next);

    invoke(startDogTickEngine());
    vi.advanceTimersByTime(DOG_ENGINE_TICK_INTERVAL_MS);

    expect(next).toHaveBeenCalledWith(startDogTickEngine());
    expect(dispatched).toHaveLength(2);
    expect(dispatched[0].type).toBe(DOG_ENGINE_TICK);
    expect(dispatched[0].payload).toMatchObject({
      now: Date.now(),
      source: "redux_heartbeat",
    });
    expect(dispatched[1].type).toBe(tickDogPolls.type);
    expect(dispatched[1].payload).toMatchObject({ now: Date.now() });

    invoke(stopDogTickEngine());
    vi.advanceTimersByTime(DOG_ENGINE_TICK_INTERVAL_MS * 2);

    expect(dispatched).toHaveLength(2);
  });
});
