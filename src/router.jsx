// src/router.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AppShell from "./AppShell.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/*",
      element: <AppShell />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      // Opt-in early to startTransition wrapping to silence v7 warning
      v7_startTransition: true,
    },
  }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
