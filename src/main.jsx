<<<<<<< HEAD
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App.jsx";
import store from "@/redux/store.js";
import { ToastProvider } from "@/components/toast/ToastProvider.jsx";

import "./index.css";
import "./App.css";
=======
/* eslint-disable react-refresh/only-export-components */

// src/main.jsx
// Vite entry point for Doggerz

import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import AppRouter from "./AppRouter.jsx";
import store from "./redux/store"; // works for ./redux/store.js or ./redux/store/index.js

import "./index.css";

import AppPreferencesEffects from "./components/AppPreferencesEffects.jsx";
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
>>>>>>> master

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
<<<<<<< HEAD
      <ToastProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  </React.StrictMode>,
=======
      <PwaProvider>
        <ToastProvider>
          <ErrorBoundary fallback={AppCrashFallback}>
            <AppPreferencesEffects />
            <PwaStatusBanners />
            <LazyDogAIEngine />
            <AppRouter />
          </ErrorBoundary>
        </ToastProvider>
      </PwaProvider>
    </Provider>
  </React.StrictMode>
>>>>>>> master
);
