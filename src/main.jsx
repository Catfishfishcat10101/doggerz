/* eslint-disable react-refresh/only-export-components */

// src/main.jsx
import * as React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import AppRouter from "./AppRouter.jsx";
import store from "./redux/store.js";
import "./index.css";
import AppPreferencesEffects from "./pages/AppPreferencesEffects.jsx";
import AppGameEffects from "./components/system/AppGameEffects.jsx";
import AppStorageHydrator from "./components/system/AppStorageHydrator.jsx";
import CheckInReminders from "./components/environment/CheckInReminders.jsx";
import { ToastProvider } from "./components/system/ToastProvider.jsx";
import ErrorBoundary from "./components/system/ErrorBoundary.jsx";
import DogAIEngine from "./features/game/DogAIEngine.jsx";
import { queryClient } from "./lib/queryClient.js";
import { selectDogRenderModel } from "./features/game/dogSelectors.js";

import { initRuntimeLogging } from "./utils/runtimeLogging.js";
import { PupProvider } from "./state/PupContext.jsx";
import { initFirebase } from "./firebase.js";
import { ensureAnonSignIn } from "./lib/firebaseClient.js";

// Simple fallback UI for ErrorBoundary
function AppCrashFallback({ error }) {
  const message = error?.message || "Unexpected error";
  const stack = error?.stack || "";
  const details = stack ? `${message}\n\n${stack}` : message;
  const canCopy =
    typeof navigator !== "undefined" && !!navigator.clipboard?.writeText;

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Crash recovery
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-emerald-200">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Try reloading the page. If it keeps happening, send the error details
          to support.
        </p>

        {error ? (
          <details className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-200">
            <summary className="cursor-pointer text-[11px] font-semibold text-emerald-200">
              Show error details
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words">
              {details}
            </pre>
          </details>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/15"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-black/45"
          >
            Back to home
          </button>
          {canCopy ? (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(details)}
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-black/45"
            >
              Copy error
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Runtime logging policy + last-resort capture (DEV verbose, PROD quiet).
if (
  import.meta.env.DEV ||
  String(import.meta.env.VITE_ENABLE_RUNTIME_LOGGING || "false") === "true"
) {
  initRuntimeLogging({ mode: import.meta.env.PROD ? "prod" : "dev" });
}

// Ensure Firebase app/auth/db are initialized before feature components mount.
initFirebase();

// Pre-warm anonymous auth so first Firestore call has request.auth available.
ensureAnonSignIn().catch((err) => {
  console.warn("[Doggerz] Startup anonymous sign-in skipped/failed:", err);
});

if (typeof window !== "undefined") {
  window.render_game_to_text = () => {
    const state = store?.getState?.();
    const renderModel = selectDogRenderModel(state || {});
    const dog = state?.dog || {};
    const stats = dog?.stats || {};
    const moodlets = Array.isArray(dog?.moodlets) ? dog.moodlets : [];
    const payload = {
      mode: "doggerz",
      route: window.location?.pathname || "/",
      dog: {
        name: dog?.name || null,
        stage: renderModel?.stage || null,
        condition: renderModel?.condition || null,
        anim: renderModel?.anim || "idle",
        isSleeping: Boolean(renderModel?.isSleeping),
      },
      stats: {
        hunger: stats?.hunger ?? null,
        thirst: stats?.thirst ?? null,
        happiness: stats?.happiness ?? null,
        energy: stats?.energy ?? null,
        cleanliness: stats?.cleanliness ?? null,
        health: stats?.health ?? null,
        affection: stats?.affection ?? null,
        mentalStimulation: stats?.mentalStimulation ?? null,
      },
      moodlets: moodlets.map((m) => ({
        type: m?.type || null,
        intensity: m?.intensity ?? null,
      })),
      coordSystem:
        "Dog viewport origin top-left; units are CSS pixels. DogPixiView 420x320.",
    };
    return JSON.stringify(payload);
  };

  window.advanceTime = (ms) =>
    new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => {
        if (now - start >= ms) return resolve();
        window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ToastProvider>
          <ErrorBoundary fallback={AppCrashFallback}>
            <PupProvider>
              <AppStorageHydrator />
              <AppPreferencesEffects />
              <AppGameEffects />
              <CheckInReminders />
              <DogAIEngine />

              <AppRouter />
            </PupProvider>
          </ErrorBoundary>
        </ToastProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
// End of src/main.jsx
