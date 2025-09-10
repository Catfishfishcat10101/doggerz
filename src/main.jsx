import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import store from "./redux/store.js";
import "./index.css";
import { registerSW } from "./pwa/registerSW.js";
import PWAInstallPrompt from "./components/PWAInstallPrompt.jsx";
import AuthListener from "./components/Auth/AuthListener.jsx";

registerSW();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthListener />
        <PWAInstallPrompt />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
// src/App.jsx