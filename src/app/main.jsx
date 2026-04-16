/* eslint-disable react-refresh/only-export-components */

// src/app/main.jsx
import * as React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import AppRouter from "./AppRouter.jsx";
import store from "@/store/store.js";
import "@/index.css";
import AppPreferencesEffects from "@/components/system/AppPreferencesEffects.jsx";
import AppGameEffects from "@/components/system/AppGameEffects.jsx";
import AuthBootstrap from "@/components/system/AuthBootstrap.jsx";
import CheckInReminders from "@/components/environment/CheckInReminders.jsx";
import { ToastProvider } from "@/components/system/ToastProvider.jsx";
import ErrorBoundary from "@/components/system/ErrorBoundary.jsx";
import { queryClient } from "@/lib/queryClient.js";
import { selectDogRenderModel } from "@/components/dog/redux/dogSelectors.js";

import {
  getCapturedErrors,
  initRuntimeLogging,
} from "@/utils/runtimeLogging.js";
import {
  debugLog,
  isDebugLoggingEnabled,
  setDebugLoggingEnabled,
} from "@/utils/debugLogger.js";
import { PupProvider } from "@/components/dog/context/PupContext.jsx";
import { ModalProvider } from "@/components/ui/modals/ModalProvider.jsx";
import { initializeDoggerz } from "./bootstrap/doggerzController.js";
import { initRemoteConfig } from "@/lib/firebase/remoteConfig.js";
import { trackAppOpen } from "@/lib/analytics/gameAnalytics.js";
import { hideLaunchSplashScreen } from "@/utils/splashScreen.js";

function renderFatalBootError(error) {
  if (typeof document === "undefined") return;

  void hideLaunchSplashScreen();

  const root = document.getElementById("root");
  if (!root) return;

  const message =
    error instanceof Error ? error.message : String(error || "Unknown error");
  const stack =
    error instanceof Error && error.stack ? error.stack : String(message);

  root.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#090a0f;color:#e5e7eb;font-family:system-ui,sans-serif">
      <div style="width:100%;max-width:720px;border:1px solid rgba(255,255,255,0.12);border-radius:24px;background:rgba(0,0,0,0.45);padding:24px;box-sizing:border-box">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#86efac">Doggerz boot failure</div>
        <h1 style="margin:12px 0 0;font-size:28px;line-height:1.1;color:#ecfccb">The app failed to start</h1>
        <p style="margin:12px 0 0;color:rgba(229,231,235,0.8)">Doggerz hit a startup error before the main UI loaded.</p>
        <pre style="margin:16px 0 0;padding:16px;border-radius:16px;background:rgba(255,255,255,0.05);overflow:auto;white-space:pre-wrap;word-break:break-word;color:#f4f4f5">${stack}</pre>
      </div>
    </div>
  `;
}

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
try {
  if (
    import.meta.env.DEV ||
    String(import.meta.env.VITE_ENABLE_RUNTIME_LOGGING || "false") === "true"
  ) {
    initRuntimeLogging();
  }
} catch (error) {
  renderFatalBootError(error);
  throw error;
}

if (typeof window !== "undefined") {
  initRemoteConfig().catch(() => {});

  trackAppOpen({
    platform:
      typeof navigator !== "undefined"
        ? String(
            navigator.userAgentData?.platform || navigator.platform || "web"
          )
        : "web",
  });

  window.__DOGGERZ_DEBUG__ = {
    ...(window.__DOGGERZ_DEBUG__ || {}),
    enabled: isDebugLoggingEnabled(),
    enable() {
      setDebugLoggingEnabled(true);
      debugLog("Debug", "enabled from window helper");
    },
    disable() {
      debugLog("Debug", "disabled from window helper");
      setDebugLoggingEnabled(false);
    },
    status() {
      return {
        enabled: isDebugLoggingEnabled(),
        capturedErrors: getCapturedErrors().length,
      };
    },
    errors() {
      return getCapturedErrors();
    },
  };
  debugLog("Boot", "Debug helper ready", window.__DOGGERZ_DEBUG__.status());

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

function mountApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Missing root element "#root"');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ErrorBoundary fallback={AppCrashFallback}>
            <AuthBootstrap />
            <AppPreferencesEffects />
            <AppGameEffects />
            <CheckInReminders />
            <ToastProvider>
              <PupProvider>
                <ModalProvider>
                  <AppRouter />
                </ModalProvider>
              </PupProvider>
            </ToastProvider>
          </ErrorBoundary>
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );

  if (typeof window !== "undefined") {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        void hideLaunchSplashScreen();
      });
    });
  } else {
    void hideLaunchSplashScreen();
  }
}

async function bootstrapApp() {
  const started = await initializeDoggerz({
    startGameLoop: () => {
      debugLog("Boot", "Doggerz controller finished; mounting React app");
      mountApp();
    },
    onCriticalError: renderFatalBootError,
  });

  if (!started) {
    debugLog("Boot", "Doggerz startup aborted before mount");
  }
}

bootstrapApp().catch((error) => {
  renderFatalBootError(error);
  throw error;
});
// End of src/main.jsx
