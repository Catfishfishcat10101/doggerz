import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";

// Use BrowserRouter in dev; HashRouter for built preview to avoid base-path/history weirdness.
const Router = import.meta.env.DEV ? BrowserRouter : HashRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Router basename="/">
      <App />
    </Router>
  </Provider>
);