import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import { store } from "@/redux/store";
import { bootstrapDogState } from "@/redux/dogThunks.js";
import "@/firebase.js";
import { unregisterAllServiceWorkers } from "@/utils/sw-tools.js";

// Bootstrap dog state from localStorage before render
store.dispatch(bootstrapDogState());

try {
  if (import.meta.env.PROD) {
    // @ts-ignore: Provided by vite-plugin-pwa at build/runtime
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  }
} catch {}

if (import.meta.env.DEV) {
  // Dev helper: Ctrl+Shift+U to unregister SW and clear caches
  // Also expose a window function for quick access in console
  //   window.swUnregister()
  // @ts-ignore - add helper to window for dev convenience
  window.swUnregister = () =>
    unregisterAllServiceWorkers({ clearCaches: true });
  window.addEventListener("keydown", async (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "U" || e.key === "u")) {
      await unregisterAllServiceWorkers({ clearCaches: true });
      // eslint-disable-next-line no-alert
      alert("Service workers unregistered and caches cleared. Reloading...");
      location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
