// src/AppRouter.jsx
// Central router for Doggerz

import * as React from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";

// Core pages
import Landing from "./pages/Landing.jsx";
import GamePage from "./pages/Game.jsx";

// Simple Adopt placeholder so /adopt works even if you haven't
// finished the real adoption flow yet.
function AdoptPlaceholder() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-3 tracking-tight text-emerald-400">
        Adoption Center (WIP)
      </h1>
      <p className="mb-6 max-w-md text-center text-zinc-400 text-sm">
        This is where youll adopt your first Doggerz pup, customize their
        look, and pick a temperament. For now, jump straight into the game
        sandbox.
      </p>
      <div className="flex gap-3">
        <Link
          to="/game"
          className="px-4 py-2 rounded-full bg-emerald-500 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Go to Game
        </Link>
        <Link
          to="/"
          className="px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-200 hover:border-emerald-400/80 hover:text-emerald-300"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}

// Catch-all 404 page
function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      <h1 className="text-3xl font-bold mb-3 tracking-tight">Page not found</h1>
      <p className="text-zinc-400 mb-6 max-w-md text-center text-sm">
        The page you tried to open doesnt exist yet or is still in
        progress. Head back home and keep caring for your pup.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-emerald-500 rounded-full text-sm font-semibold text-black hover:bg-emerald-400"
      >
        Go to Doggerz Home
      </Link>
    </main>
  );
}

// Define all routes here
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/game",
    element: <GamePage />,
  },
  {
    path: "/adopt",
    element: <AdoptPlaceholder />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
