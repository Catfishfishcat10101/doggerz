// src/App.jsx
// Top-level routing for Doggerz

import * as React from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
// Replace alias import with a relative import to avoid HMR/alias resolution issues
import Landing from "./pages/Landing";

// Minimal NotFound component (kept local so router creation is self-contained)
function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Page not found</h1>
      <p className="text-zinc-400 mb-6">The page you tried to open doesn't exist or is still in progress.</p>
      <Link to="/" className="px-4 py-2 bg-emerald-500 rounded-md text-black font-medium">Go home</Link>
    </main>
  );
}

// Fallback route set — keeps app usable even if a project routes file is missing
const resolvedRoutes = [
  { path: "/", element: <Landing /> },
  {
    path: "*",
    element: (
      <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-zinc-400 mb-6">The page you tried to open doesn't exist or is still in progress.</p>
        <Link to="/" className="px-4 py-2 bg-emerald-500 rounded-md text-black font-medium">Go home</Link>
      </main>
    )
  }
];

const router = createBrowserRouter(resolvedRoutes); // no future flags — avoids dev warnings if package is older

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
