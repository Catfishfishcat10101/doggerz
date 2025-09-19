// src/main.jsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import store from "./redux/store.js";
import "./index.css";
import { registerSW } from "./pwa/registerSW.js";
import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";
import AuthListener from "./components/Auth/AuthListener.jsx";
import { router } from "./router";

// (Optional) small UX toast when new SW is available
import UpdateToast from "./components/Shell/UpdateToast.jsx";
// (Optional) guard against white screens on lazy route errors
import ErrorBoundary from "./components/Shell/ErrorBoundary.jsx";

// Ensure we don’t double-register during HMR in dev
if (!window.__SW_REGISTERED__) {
  registerSW();
  window.__SW_REGISTERED__ = true;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthListener />
      <PWAInstallPrompt />
      <UpdateToast />
      <ErrorBoundary>
        <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
