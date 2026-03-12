import { describe, expect, it, vi } from "vitest";

import { createAbortError, createTimeoutSignal } from "@/utils/abortSignal.js";

describe("abortSignal", () => {
  it("creates AbortError-shaped errors", () => {
    const error = createAbortError("Nope");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AbortError");
    expect(error.message).toBe("Nope");
  });

  it("aborts after the configured timeout", () => {
    vi.useFakeTimers();

    const timeout = createTimeoutSignal({ timeoutMs: 500, message: "Weather timeout" });
    expect(timeout.signal.aborted).toBe(false);

    vi.advanceTimersByTime(500);

    expect(timeout.signal.aborted).toBe(true);
    expect(timeout.signal.reason?.name).toBe("AbortError");
    expect(timeout.signal.reason?.message).toBe("Weather timeout");

    timeout.cleanup();
    vi.useRealTimers();
  });

  it("mirrors parent abort signals", () => {
    const parent = new AbortController();
    const timeout = createTimeoutSignal({ parentSignal: parent.signal, timeoutMs: 5000 });

    parent.abort(createAbortError("Parent cancelled"));

    expect(timeout.signal.aborted).toBe(true);
    expect(timeout.signal.reason?.message).toBe("Parent cancelled");

    timeout.cleanup();
  });
});