// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";

import AppRouter from "./app/AppRouter.jsx";
import { PupProvider } from "./components/dog/context/PupContext.jsx";
import AppPreferencesEffects from "./components/system/AppPreferencesEffects.jsx";
import AppStorageHydrator from "./components/system/AppStorageHydrator.jsx";
import AuthBootstrap from "./components/system/AuthBootstrap.jsx";
import { ToastProvider } from "./components/system/ToastProvider.jsx";
import { ModalProvider } from "./components/ui/modals/ModalProvider.jsx";
import store from "./store/store.js";
import { queryClient } from "./lib/queryClient.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AppStorageHydrator />
        <AuthBootstrap />
        <AppPreferencesEffects />
        <PupProvider>
          <ToastProvider>
            <ModalProvider>
              <AppRouter />
            </ModalProvider>
          </ToastProvider>
        </PupProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
