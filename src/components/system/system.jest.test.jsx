import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "@/test/testUtils.jsx";
import CrashFallback from "./CrashFallback.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { ToastProvider } from "./ToastProvider.jsx";
import AppGameEffects from "./AppGameEffects.jsx";
import AppStorageHydrator from "./AppStorageHydrator.jsx";
import { ToastContext } from "@/state/toastContext.js";

const mockGetStoredValue = jest.fn();

jest.mock("@/utils/nativeStorage.js", () => ({
  getStoredValue: (...args) => mockGetStoredValue(...args),
}));

function ToastTrigger() {
  const api = React.useContext(ToastContext);
  return (
    <button type="button" onClick={() => api.success("Saved!")}>
      Trigger toast
    </button>
  );
}

describe("system components", () => {
  test("CrashFallback reload and reset actions", () => {
    const reset = jest.fn();

    renderWithProviders(
      <CrashFallback error={new Error("x")} reset={reset} title="Oops" />
    );
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Reload" }))
    ).not.toThrow();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalled();
  });

  test("ErrorBoundary renders fallback UI when forced into error state", async () => {
    const boundaryRef = React.createRef();
    renderWithProviders(
      <ErrorBoundary ref={boundaryRef}>
        <div>Child</div>
      </ErrorBoundary>
    );

    act(() => {
      boundaryRef.current.setState({
        hasError: true,
        error: new Error("boom"),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    });
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Refresh Page" }))
    ).not.toThrow();
  });

  test("ToastProvider shows and dismisses toast", async () => {
    renderWithProviders(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger toast" }));
    expect(await screen.findByText("Saved!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(() =>
      expect(screen.queryByText("Saved!")).not.toBeInTheDocument()
    );
  });

  test("AppGameEffects sets document dataset flags", async () => {
    renderWithProviders(<AppGameEffects />, {
      preloadedState: {
        dog: {
          skillTree: { lastUnlockedAt: Date.now(), lastBranchId: "companion" },
          polls: { active: { expiresAt: Date.now() + 20_000 } },
        },
        settings: {
          gameFxSkillPulse: true,
          gameFxStoryGlow: true,
          gameFxBranchAccent: true,
        },
      },
    });

    await waitFor(() => {
      expect(document.documentElement.dataset.skillBranch).toBe("companion");
      expect(document.documentElement.dataset.storyActive).toBe("1");
    });
  });

  test("AppStorageHydrator dispatches hydrated user/settings", async () => {
    mockGetStoredValue
      .mockResolvedValueOnce(
        JSON.stringify({ displayName: "Alpha", zip: "60601" })
      )
      .mockResolvedValueOnce(JSON.stringify({ theme: "dark" }));

    const { store } = renderWithProviders(<AppStorageHydrator />);

    await waitFor(() => {
      expect(store.getState().user.displayName).toBe("Alpha");
      expect(store.getState().settings.theme).toBe("dark");
    });
  });
});
