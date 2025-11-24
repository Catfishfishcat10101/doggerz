// src/main.jsx
// @ts-nocheck

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "@/redux/store.js";
import { AppRouter } from "./router.jsx";

import "./index.css"; // Tailwind + base reset (@tailwind stuff)
import "./styles.css"; // Your Doggerz global theme

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>,
);
