import React, { Suspense, lazy, useCallback } from "react";
import { ChevronDown, PawPrint, LogOut, RefreshCcw, Gamepad } from "lucide-react";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import ErrorBoundary from "../common/ErrorBoundary";
import {
  StatsBarSkeleton,
  PanelSkeleton,
  DogAreaSkeleton,
} from "../common/Skeletons";

// ⚠️ Keep your original file paths here. Swap to lazy to speed TTI.
const Splash = lazy(() => import("./Splash"));
const DogName = lazy(() => import("../Dog/DogName"));
const Controls = lazy(() => import("../Controls"));
const Status = lazy(() => import("../Stats/Status"));
const Tricks = lazy(() => import("../Training/Tricks"));
const FirebaseAutoSave = lazy(() => import("../FirebaseAutoSave"));
const ToyBox = lazy(() => import("../ToyBox"));
const ResetGame = lazy(() => import("../ResetGame"));
const StatsBar = lazy(() => import("../Stats/StatsBar"));
const LogoutButton = lazy(() => import("../../Auth/LogoutButton"));
const Dog = lazy(() => import("../../Features/Dog"));
const CleanlinessBar = lazy(() => import("../Stats/CleanlinessBar"));
const PoopScoop = lazy(() => import("../PoopScoop"));

/**
 * Layout goals:
 * - Header (brand + quick actions)
 * - 12-col responsive grid:
 *   - Left rail: Tricks & ToyBox (collapsible on mobile)
 *   - Center: Dog area (Dog, Splash overlay, PoopScoop zone)
 *   - Right rail: Status panels
 * - Sticky mobile action dock
 * - Keyboard shortcuts
 * - A11y: landmarks, skip link, aria-live for stat changes
 * - Error isolation per panel
 */

const GameScreen = () => {
  // ——— Handlers you can wire into children now or later ———
  const handleClearPoops = useCallback(() => {
    // Replace with your Redux action when ready
    console.log("Poops cleared");
  }, []);

  // ——— Keyboard shortcuts ———
  useKeyboardShortcuts({
    onPoopScoop: handleClearPoops,
    // You can pass movement callbacks once Controls/Dog expose them
  });

  return (
    <div
      className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-600 text-white"
      data-testid="game-screen"
    >
      {/* Background flair */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0 10px, transparent 10px 20px)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 animate-pulse">
        <div className="absolute -top-10 -left-16 rotate-12 opacity-20 text-white">
          <PawPrint size={220} />
        </div>
        <div className="absolute bottom-10 right-10 rotate-[20deg] opacity-10">
          <PawPrint size={180} />
        </div>
      </div>

      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-black/70 px-3 py-2 rounded-md"
      >
        Skip to game
      </a>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm/0">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm flex items-center gap-3">
            <PawPrint className="shrink-0" />
            Doggerz
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <ErrorBoundary name="AutoSave">
              <Suspense fallback={<span className="text-sm opacity-80">Saving…</span>}>
                <FirebaseAutoSave />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary name="Reset">
              <Suspense fallback={<button className="btn btn-sm opacity-70">Reset…</button>}>
                <ResetGame>
                  {(reset) => (
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                      title="Reset game"
                    >
                      <RefreshCcw size={18} />
                      Reset
                    </button>
                  )}
                </ResetGame>
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary name="Logout">
              <Suspense fallback={<button className="btn btn-sm opacity-70">Logout…</button>}>
                <LogoutButton className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                  <LogOut size={18} />
                  Logout
                </LogoutButton>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </header>

      {/* Top Stat Bars */}
      <section aria-label="Stats" className="mx-auto w-full max-w-7xl px-4">
        <ErrorBoundary name="StatsBar">
          <Suspense fallback={<StatsBarSkeleton />}>
            <StatsBar aria-live="polite" />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="CleanlinessBar">
          <Suspense fallback={<div className="mt-2"><StatsBarSkeleton /></div>}>
            <div className="mt-2">
              <CleanlinessBar aria-live="polite" />
            </div>
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Main Grid */}
      <main id="main" role="main" className="mx-auto w-full max-w-7xl px-4 py-4 md:py-6">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left Rail: Training & Toys (collapsible on small screens) */}
          <aside className="col-span-12 md:col-span-3 space-y-4">
            <details className="md:open bg-white/10 rounded-2xl shadow-sm">
              <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                <span className="font-semibold">Training</span>
                <ChevronDown className="opacity-80" />
              </summary>
              <div className="p-3 pt-0">
                <ErrorBoundary name="Tricks">
                  <Suspense fallback={<PanelSkeleton height="14rem" />}>
                    <Tricks />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </details>

            <details className="md:open bg-white/10 rounded-2xl shadow-sm">