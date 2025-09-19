// src/Features/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Redux (optional if you already use it)
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

// Router
import { BrowserRouter } from "react-router-dom";

// Head tags
import { HelmetProvider } from "react-helmet-async";

export function renderApp() {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("Missing #root in index.html");

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}
