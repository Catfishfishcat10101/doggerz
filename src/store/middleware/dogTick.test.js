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

  it("dispatches an immediate heartbeat and continues ticking on the interval", async () => {
    const {
      canTickNow,
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

    expect(canTickNow()).toBe(true);

    invoke(startDogTickEngine());

    expect(next).toHaveBeenCalledWith(startDogTickEngine());
    expect(dispatched).toHaveLength(2);
    expect(dispatched[0].type).toBe(DOG_ENGINE_TICK);
    expect(dispatched[0].payload).toMatchObject({
      now: Date.now(),
      source: "redux_heartbeat",
    });
    expect(dispatched[1].type).toBe(tickDogPolls.type);
    expect(dispatched[1].payload).toMatchObject({ now: Date.now() });

    vi.advanceTimersByTime(DOG_ENGINE_TICK_INTERVAL_MS);

    expect(dispatched).toHaveLength(4);
    expect(dispatched[2].type).toBe(DOG_ENGINE_TICK);
    expect(dispatched[2].payload).toMatchObject({
      now: Date.now(),
      source: "redux_heartbeat",
    });
    expect(dispatched[3].type).toBe(tickDogPolls.type);
    expect(dispatched[3].payload).toMatchObject({ now: Date.now() });

    invoke(stopDogTickEngine());
    vi.advanceTimersByTime(DOG_ENGINE_TICK_INTERVAL_MS * 2);

    expect(dispatched).toHaveLength(4);
  });

  it("does not create duplicate intervals when started twice", async () => {
    const {
      dogTickMiddleware,
      startDogTickEngine,
      DOG_ENGINE_TICK_INTERVAL_MS,
    } = await import("@/store/middleware/dogTick.js");

    const dispatched = [];
    const next = vi.fn((value) => value);
    const storeApi = {
      dispatch: (value) => dispatched.push(value),
      getState: () => ({}),
    };

    const invoke = dogTickMiddleware(storeApi)(next);

    invoke(startDogTickEngine());
    invoke(startDogTickEngine());
    vi.advanceTimersByTime(DOG_ENGINE_TICK_INTERVAL_MS);

    expect(dispatched).toHaveLength(4);
  });

  it("skips immediate and scheduled ticks while the document is hidden", async () => {
    vi.stubGlobal("document", { hidden: true });

    const {
      canTickNow,
      dogTickMiddleware,
      startDogTickEngine,
      DOG_ENGINE_TICK_INTERVAL_MS,
    } = await import("@/store/middleware/dogTick.js");

    const dispatched = [];
    const next = vi.fn((value) => value);
    const storeApi = {
      dispatch: (value) => dispatched.push(value),
      getState: () => ({}),
    };

    const invoke = dogTickMiddleware(storeApi)(next);

    expect(canTickNow()).toBe(false);

    invoke(startDogTickEngine());
    vi.advanceTimersByTime(DOG_ENGINE_TICK_INTERVAL_MS * 2);

    expect(next).toHaveBeenCalledWith(startDogTickEngine());
    expect(dispatched).toHaveLength(0);
  });
});
