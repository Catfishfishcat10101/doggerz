// src/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";

// PWA bits (safe import; may be tree-shaken in dev)
import { registerSW } from "./pwa/registerSW.js";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt.jsx";

// Auth listener wires Firebase auth -> Redux
import AuthListener from "@/components/Auth/AuthListener.jsx";

/** Tiny inline toast shown when a new SW version is waiting. */
function UpdateToast({ visible, onReload }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] rounded-2xl bg-amber-500 text-black border border-amber-600 p-3 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-semibold">Update available</div>
          <div className="text-sm">A new Doggerz build is ready. Reload to apply.</div>
        </div>
        <button
          onClick={onReload}
          className="px-3 py-1 rounded-xl bg-black/10 hover:bg-black/20 text-sm"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

function Boot() {
  const [updateReady, setUpdateReady] = useState(false);
  const [applyUpdate, setApplyUpdate] = useState(() => () => {});

  // Only register a service worker in *production*.
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let cleanup = () => {};
    try {
      const updateSW = registerSW({
        onNeedRefresh: (reload) => {
          setApplyUpdate(() => reload);
          setUpdateReady(true);
        },
        onOfflineReady: () => {
          // Optional: toast "Ready for offline"
        },
        onRegistered: (/* reg */) => {
          // Optional: console.info("SW registered");
        },
      });

      // If registerSW returns a manual apply function, keep it
      if (typeof updateSW === "function") {
        setApplyUpdate(() => updateSW);
        cleanup = () => {}; // nothing specific to clean
      }
    } catch (e) {
      // Don’t let SW errors kill dev UX
      console.warn("SW registration skipped:", e?.message || e);
    }
    return cleanup;
  }, []);

  return (
    <React.StrictMode>
      <Provider store={store}>
        {/* Keep BASE_URL so routes work under GitHub Pages subpath */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthListener />
          <App />
          <PWAInstallPrompt />
          <UpdateToast
            visible={updateReady}
            onReload={() => {
              setUpdateReady(false);
              try { applyUpdate(); } catch {/* no-op */}
            }}
          />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Boot />);
