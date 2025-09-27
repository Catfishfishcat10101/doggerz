import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "@/redux/store.js";
import App from "./App.jsx";
import "./index.css";

if (import.meta.env.DEV) {
  // handy for quick env checks in DevTools: ENV.VITE_FIREBASE_PROJECT_ID
  window.ENV = import.meta.env;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
