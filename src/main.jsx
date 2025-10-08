// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import store from "./redux/store";

// Tailwind entry + app styles (single source of truth)
import "./styles.css";

// OPTIONAL: Inter font (uncomment only if you've installed @fontsource/inter)
// import "@fontsource/inter/variable.css";
// import "@fontsource/inter/400.css";
// import "@fontsource/inter/600.css";

// OPTIONAL: initialize Firebase once if your app exports configured clients
// import "@/lib/firebase";

// OPTIONAL: PWA service worker registration (vite-plugin-pwa present in your build)
import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });

/** Minimal error boundary to avoid white screens on unexpected crashes */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // hook up to telemetry if desired
    console.error("RootErrorBoundary:", err, info);
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
