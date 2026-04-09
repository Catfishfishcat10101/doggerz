import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDogAnimationController } from "./useDogAnimationController.js";

describe("useDogAnimationController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns to the updated best loop state after one-shot completion", async () => {
    const { result, rerender } = renderHook(
      (props) => useDogAnimationController(props),
      {
        initialProps: {
          dog: {},
          brainState: {},
          renderModel: {},
          requestedAction: "bark",
          requestedFacing: "",
        },
      }
    );

    await waitFor(() => {
      expect(result.current.animationClip.key).toBe("bark");
      expect(result.current.resolution.priorityBucket).toBe("one_shot");
    });

    rerender({
      dog: { sleeping: true, isAsleep: true },
      brainState: {},
      renderModel: {},
      requestedAction: "",
      requestedFacing: "",
    });

    act(() => {
      vi.advanceTimersByTime(2400);
    });

    await waitFor(() => {
      expect(result.current.animationClip.key).toBe("sleep");
      expect(result.current.resolvedAction).toBe("sleep");
    });
  });
});
