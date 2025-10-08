// src/layout/RootLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

// If you've added these earlier, keep them; otherwise remove the imports & JSX usage.
import ScrollRestorer from "@/layout/ScrollRestorer.jsx";
import RouteFocus from "@/layout/RouteFocus.jsx";
import RouteBoundary from "@/layout/RouteBoundary.jsx";

export default function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-dvh flex flex-col bg-slate-900 text-white">
      {/* Accessible skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3
                   focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2
                   focus:text-slate-900"
      >
        Skip to content
      </a>

      <NavBar />

      {/* Route UX helpers */}
      <ScrollRestorer />
      <RouteFocus />

      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          {/* Boundary resets on path change so errors don't “stick” across pages */}
          <RouteBoundary resetKey={location.pathname}>
            <Outlet />
          </RouteBoundary>
        </div>
      </main>

      {/* Optional: toasts/footers/portals (add when you have them) */}
      {/* <Footer /> */}
      {/* <Toaster /> */}
    </div>
  );
}
