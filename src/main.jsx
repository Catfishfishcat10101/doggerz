// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store";
import App from "./App.jsx";

// Tailwind entry + app styles
import "./styles.css";

// Initialize Firebase singletons (auth, db, storage, functions)
import "@/lib/firebase";

// ----- PWA: register service worker + surface updates -----
let unregister = null;
try {
  if ("serviceWorker" in navigator) {
    const { registerSW } = await import("virtual:pwa-register");
    unregister = registerSW({
      immediate: true,
      onRegisteredSW(swUrl, reg) {
        if (import.meta.env.DEV) {
          console.info("[pwa] SW registered:", swUrl, reg);
        }
      },
      onRegisterError(err) {
        if (import.meta.env.DEV) console.warn("[pwa] register error:", err);
      },
      onNeedRefresh() {
        showUpdateToast();
      },
      onOfflineReady() {
        if (import.meta.env.DEV) console.info("[pwa] offline ready");
      },
    });
  } else if (import.meta.env.DEV) {
    console.info("[pwa] serviceWorker not supported; skipping SW registration");
  }
} catch (e) {
  // vite-plugin-pwa not present? Fine — no-op.
  if (import.meta.env.DEV) console.info("[pwa] plugin not active; skipping SW registration");
}

// Minimal in-DOM toast; no extra libs
function showUpdateToast() {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.insetInline = "0";
  host.style.bottom = "1rem";
  host.style.display = "grid";
  host.style.placeItems = "center";
  host.style.zIndex = "9999";
  host.innerHTML = `
    <div role="status" aria-live="polite"
      style="background:rgba(17,24,39,.98);color:#e5e7eb;border:1px solid rgba(255,255,255,.12);
             padding:.75rem 1rem;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.4);
             display:flex;gap:.5rem;align-items:center;">
      <span style="font-weight:600">Update available</span>
      <span style="opacity:.8">Reload to apply?</span>
      <button id="pwa-reload" style="margin-left:.75rem;background:#34d399;color:#0b1020;
              border:none;border-radius:10px;padding:.4rem .7rem;font-weight:700;cursor:pointer">
        Reload
      </button>
      <button id="pwa-later" style="margin-left:.25rem;background:transparent;color:#e5e7eb;
              border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:.35rem .6rem;cursor:pointer">
        Later
      </button>
    </div>`;
  const root = document.body.appendChild(host);
  const remove = () => root.remove();
  root.querySelector("#pwa-reload")?.addEventListener("click", () => location.reload());
  root.querySelector("#pwa-later")?.addEventListener("click", remove);
  setTimeout(remove, 12000);
}

// ----- Global error boundary -----
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // TODO: telemetry hook
    // eslint-disable-next-line no-console
    console.error("RootErrorBoundary:", err, info);
    try {
      window.dispatchEvent(new CustomEvent("doggerz:error", { detail: { err, info } }));
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100 p-6">
          <div className="max-w-lg w-full space-y-4">
            <h1 className="text-2xl font-bold">Something broke.</h1>
            <p className="opacity-80">
              The UI crashed. Check the console for details. A hard refresh usually clears transient state issues.
            </p>
            <button
              className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400"
              onClick={() => location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ----- Bootstrap -----
const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element. Check index.html");
}

// Optional subpath deploys (e.g., GitHub Pages). Default = "/".
const basename = import.meta.env.VITE_BASENAME || "/";

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// Hot module cleanup for the PWA registration (dev nicety)
if (import.meta.hot && typeof unregister === "function") {
  import.meta.hot.dispose(() => {
    try { unregister(); } catch {}
  });
}
