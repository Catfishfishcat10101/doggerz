import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useDayNightBackground } from "@/hooks/environment/useDayNightBackground.js";

describe("useDayNightBackground", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects backyard SVG assets when background images are enabled", async () => {
    class FakeImage {
      set src(value) {
        this._src = value;
        queueMicrotask(() => {
          if (String(value).includes("/backgrounds/backyard-")) {
            this.onload?.();
            return;
          }
          this.onerror?.();
        });
      }
    }

    vi.stubGlobal("Image", FakeImage);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const wrapper = ({ children }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      );

    const { result } = renderHook(
      () =>
        useDayNightBackground({
          enableImages: true,
          pollIntervalMs: 60_000,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(String(result.current.style.backgroundImage || "")).toContain(
        "/backgrounds/backyard-"
      );
    });

    queryClient.clear();
  });
});
