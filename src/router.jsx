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
    },
  }
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
