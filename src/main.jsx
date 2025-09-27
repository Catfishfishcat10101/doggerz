import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";

// Treat vite preview (localhost:4173) as "preview", not production-CDN
const isPreview = import.meta.env.PROD && location.hostname === "localhost";
const Router = isPreview ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router basename="/">
      <App />
    </Router>
  </Provider>
);

// IMPORTANT: do NOT register a SW in preview; it will cache bad chunks and blank-screen you.
// If you have code that registers /sw.js or imports "virtual:pwa-register", guard it like:
if ("serviceWorker" in navigator && import.meta.env.PROD && !isPreview) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}