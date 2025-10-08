// src/layout/PublicLayout.jsx
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import NavBar from "@/components/UI/NavBar.jsx";
import RouteBoundary from "@/layout/RouteBoundary.jsx";

// If you created these helpers earlier, keep the imports & JSX.
// Otherwise, remove the imports and the <ScrollRestorer/> / <RouteFocus/> lines.
import ScrollRestorer from "@/layout/ScrollRestorer.jsx";
import RouteFocus from "@/layout/RouteFocus.jsx";

// Footer is optional — render only if it exists as a function component.
import Footer from "@/components/UI/Footer.jsx";

function Fallback() {
  return (
    <div className="min-h-[40vh] grid place-items-center">
      <div className="animate-pulse rounded-2xl border border-white/15 px-6 py-4">
        Loading…
      </div>
    </div>
  );
}

export default function PublicLayout() {
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

      {/* Route UX helpers (safe to remove if you didn't add them) */}
      <ScrollRestorer />
      <RouteFocus />

      <main id="main" className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 flex-1">
        {/* Reset boundary on path change so errors don’t “stick” */}
        <RouteBoundary resetKey={location.pathname}>
          <Suspense fallback={<Fallback />}>
            <Outlet />
          </Suspense>
        </RouteBoundary>
      </main>

      {typeof Footer === "function" && <Footer />}
    </div>
  );
}
