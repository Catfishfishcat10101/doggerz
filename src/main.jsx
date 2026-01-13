/* eslint-disable react-refresh/only-export-components */

// src/main.jsx
// Vite entry point for Doggerz

import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Analytics } from "@vercel/analytics/react";

import AppRouter from "./AppRouter.jsx";
import store from "./redux/store.js";

import "./index.css";

import AppPreferencesEffects from "./pages/AppPreferencesEffects.jsx";
import AppGameEffects from "./components/AppGameEffects.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import PwaProvider from "./pwa/PwaProvider.jsx";
import PwaStatusBanners from "./components/PwaStatusBanners.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CrashFallback from "./components/CrashFallback.jsx";
import { initRuntimeLogging } from "./utils/runtimeLogging.js";
import { prefetchDogAIEngine } from "./utils/prefetch.js";

// Runtime logging policy + last-resort capture (DEV verbose, PROD quiet).
initRuntimeLogging({ mode: import.meta.env.PROD ? "prod" : "dev" });

function LazyDogAIEngine() {
  const [Engine, setEngine] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;

    const shouldStartNow = window.location.pathname.startsWith("/game");

    const load = () => {
      prefetchDogAIEngine()
        .then((m) => {
          if (cancelled) return;
          setEngine(() => m.default);
        })
        .catch(() => {
          // ignore
        });
    };

    if (shouldStartNow) {
      load();
      return () => {
        cancelled = true;
      };
    }

    // Otherwise defer until idle so first paint isn't delayed.
    const ric = window.requestIdleCallback
      ? window.requestIdleCallback(load, { timeout: 2000 })
      : window.setTimeout(load, 1200);

    return () => {
      cancelled = true;
      try {
        if (window.cancelIdleCallback && typeof ric === "number") {
          window.cancelIdleCallback(ric);
        } else {
          window.clearTimeout(ric);
        }
      } catch {
        // ignore
      }
    };
  }, []);

  if (!Engine) return null;
  return <Engine />;
}

function AppCrashFallback({ error }) {
  return (
    <CrashFallback
      title="Doggerz hit an unexpected snag"
      subtitle="You can refresh, or copy debug info for support."
      error={error}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PwaProvider>
        <ToastProvider>
          <ErrorBoundary fallback={AppCrashFallback}>
            <AppPreferencesEffects />
            <AppGameEffects />
            <PwaStatusBanners />
            <LazyDogAIEngine />
            <AppRouter />
            <Analytics />
          </ErrorBoundary>
        </ToastProvider>
      </PwaProvider>
    </Provider>
  </React.StrictMode>
);
// End of src/main.jsx
