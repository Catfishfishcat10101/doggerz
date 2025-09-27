import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import store from "./redux/store.js";

// Use BrowserRouter in dev, HashRouter in built preview to avoid history/base issues
const Router = import.meta.env.DEV ? BrowserRouter : HashRouter;

// Do NOT register a service worker during local preview; stale caches cause “blank screen”.
const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);