// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";

// If you have Redux store, keep these two lines; otherwise remove them and render <App /> directly.
import { Provider } from "react-redux";
import store from "@/redux/store";

import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
