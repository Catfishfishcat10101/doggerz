// src/layout/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

/**
 * AuthLayout → gated shell for the game/app after login.
 * - Wide content area for canvas/game.
 * - Same a11y primitives as AppLayout.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-zinc-100 focus:text-zinc-900 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header role="banner">
        <NavBar />
      </header>

      <main id="main" role="main" className="flex-1 p-4 md:p-6">
        {/* Auth views (game/shop/settings) want horizontal real estate */}
        <div className="mx-auto w-full max-w-[1400px]">
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
