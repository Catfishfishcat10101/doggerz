// src/App.jsx
// @ts-nocheck

import React from "react";
import { AppRouter } from "./router.jsx";

/**
 * Root App component.
 *
 * - Redux Provider is wrapped around this in src/main.jsx
 * - React Router is handled by AppRouter (createBrowserRouter + RouterProvider)
 * - All actual pages, header, footer, and <Routes> live in AppShell.jsx
 */
export default function App() {
  return <AppRouter />;
}
