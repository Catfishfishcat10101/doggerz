import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./AppRouter";
import "./index.css";

const root =
  document.getElementById("root") ||
  document.body.appendChild(document.createElement("div"));
root.id = "root";

createRoot(root).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
// src/main.jsx
// @ts-nocheck

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "@/redux/store.js";
import App from "@/App.jsx";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}
const root = createRoot(rootEl);

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
