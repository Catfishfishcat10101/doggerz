// src/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";

import { registerSW } from "./pwa/registerSW.js";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt.jsx";
import AuthListener from "@/components/Auth/AuthListener.jsx";

/** Minimal inline toast for SW updates (keeps main self-contained). */
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

  // Register the service worker; surface update UI when a new version is waiting.
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh: (reload) => {
        setApplyUpdate(() => reload);
        setUpdateReady(true);
      },
      onOfflineReady: () => {
        // Optional: emit a toast "Ready for offline"
      },
      onRegistered: () => {
        // Optional: console.info("SW registered", reg);
      },
    });

    // keep a handle so we can force-apply if needed
    setApplyUpdate(() => updateSW);
  }, []);

  return (
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <AuthListener />
          <App />
          <PWAInstallPrompt />
          <UpdateToast
            visible={updateReady}
            onReload={() => {
              setUpdateReady(false);
              applyUpdate(); // activates waiting SW & reloads
            }}
          />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Boot />);
