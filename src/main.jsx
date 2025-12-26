// src/main.jsx
// Vite entry point for Doggerz

import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import AppRouter from "./AppRouter.jsx";
import store from "./redux/store"; // works for ./redux/store.js or ./redux/store/index.js

import "./index.css";
import "./styles.css";
import "./App.css";

import AppPreferencesEffects from "./components/AppPreferencesEffects.jsx";
import AppBootGate from "./components/AppBootGate.jsx";
import DogAIEngine from "./features/game/DogAIEngine.jsx";

// Register the app's service worker in production for offline/PWA support.
// (In dev, Vite's HMR + caching is a bad combo; keep SW off.)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("[Doggerz] SW registration failed", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppPreferencesEffects />
      <DogAIEngine />
      <AppBootGate>
        <AppRouter />
      </AppBootGate>
    </Provider>
  </React.StrictMode>
);
