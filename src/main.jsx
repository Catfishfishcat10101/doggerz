// src/main.jsx
import AppRouter from "./router.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/redux/store.js";
import "./index.css"; // Tailwind + base reset (@tailwind stuff)
import "./styles.css"; // Your Doggerz global theme

// Dev-only accessibility auditing (axe-core). Dynamically loaded so it is tree-shaken from production builds.
if (import.meta.env?.DEV) {
  // Load after React imports but before initial render so first paint is analyzed.
  import("./accessibility/axeSetup.js").catch((e) => {
    console.warn("[a11y] Failed to load axe accessibility tooling", e);
  });
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found. Check your index.html.");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>,
);
