// src/layout/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

/**
 * AppLayout → public shell (landing, marketing, auth screens).
 * - High-contrast baseline for photophobia/colorblind safety.
 * - Skip link for a11y; semantic landmarks for screen readers.
 */
export default function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100 antialiased">
      {/* Skip to main for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-zinc-100 focus:text-zinc-900 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header role="banner">
        <NavBar />
      </header>

      <main
        id="main"
        role="main"
        className="flex-1 grid place-items-center p-6"
        aria-live="polite"
      >
        {/* Public pages are typically form/narrow content */}
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
          <Outlet />
        </div>
      </main>

      <footer
        role="contentinfo"
        className="border-t border-zinc-800/70 px-6 py-4 text-sm text-zinc-400"
      >
        <p className="select-none">
          Doggerz © 2025 — No grind. Just vibes.
        </p>
      </footer>
    </div>
  );
}
