// src/main.jsx
// Vite entry point for Doggerz

import * as React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import AppRouter from "./AppRouter.jsx";
import store from "./redux/store"; // works for ./redux/store.js or ./redux/store/index.js

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>
);
