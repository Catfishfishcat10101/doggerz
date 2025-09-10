import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";
import { registerSW } from "./pwa/registerSW.js";
import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";

registerSW();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* Install prompt listens for A2HS event */}
        <PWAInstallPrompt />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
// src/main.jsx

