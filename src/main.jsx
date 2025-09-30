import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "@/redux/store.js";
import { attachAuthListener } from "@/redux/bootAuth.js";
import App from "./App.jsx";

// global styles (tailwind is optional; omit if you don’t use it)
import "./styles.css";

attachAuthListener(store); // safe even if not signed in

const el = document.getElementById("root");
const root = createRoot(el);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
