// src/main.jsx
import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import AppRouter from "./AppRouter.jsx";
import store from "./redux/store.js";
import "./index.css";
import AppPreferencesEffects from "./pages/AppPreferencesEffects.jsx";
import AppGameEffects from "./components/AppGameEffects.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import PwaProvider from "./pwa/PwaProvider.jsx";
import PwaStatusBanners from "./components/PwaStatusBanners.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

import { initRuntimeLogging } from "./utils/runtimeLogging.js";
import { PupProvider } from "./state/PupContext.jsx";

// Simple fallback UI for ErrorBoundary
function AppCrashFallback({ error }) {
  return (
    <div style={{ padding: 32, textAlign: "center", color: "red" }}>
      <h1>Something went wrong.</h1>
      {error && <pre>{error.message}</pre>}
      <p>Please reload the page or contact support.</p>
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
