/* eslint-disable react-refresh/only-export-components */

// src/main.jsx
import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import AppRouter from "./AppRouter.jsx";
import store from "./redux/store.js";
import "./index.css";
import AppPreferencesEffects from "./pages/AppPreferencesEffects.jsx";
import AppGameEffects from "./components/AppGameEffects.jsx";
import CheckInReminders from "./components/CheckInReminders.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import PwaProvider from "./pwa/PwaProvider.jsx";
import PwaStatusBanners from "./components/PwaStatusBanners.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import { initRuntimeLogging } from "./utils/runtimeLogging.js";
import { PupProvider } from "./state/PupContext.jsx";

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
initRuntimeLogging({ mode: import.meta.env.PROD ? "prod" : "dev" });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PwaProvider>
        <ToastProvider>
          <ErrorBoundary fallback={AppCrashFallback}>
            <PupProvider>
              <AppPreferencesEffects />
              <AppGameEffects />
              <CheckInReminders />
              <PwaStatusBanners />

              <AppRouter />
            </PupProvider>
          </ErrorBoundary>
        </ToastProvider>
      </PwaProvider>
    </Provider>
  </React.StrictMode>
);
// End of src/main.jsx
