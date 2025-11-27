// src/router.jsx
// Doggerz: Centralized router setup using react-router v6+.
// Usage: <AppRouter /> at the root of your app (see main.jsx).

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppShell from "./AppShell.jsx";

const router = createBrowserRouter(
  [
    {
      // Send all URLs into AppShell; AppShell itself handles <Routes>.
      path: "/*",
      element: <AppShell />,
    },
  ],
  {
    future: {
      // Opt-in flags for newer React Router behaviour (safe if unsupported).
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

/**
 * AppRouter: Provides the main router for Doggerz.
 * Wraps the app in RouterProvider and handles all navigation.
 */
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
