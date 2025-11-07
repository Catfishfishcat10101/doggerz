import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import AuthProvider from "@/context/AuthProvider";
import App from "./App.jsx";
import "./index.css";

// src/main.jsx
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,                 // install asap
  onNeedRefresh() {
    // You can show a toast; simplest is to reload immediately:
    location.reload();
  },
  onOfflineReady() {
    console.log('Doggerz is ready to work offline.');
  },
});


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
