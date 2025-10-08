// src/layout/RootLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";
import ScrollRestorer from "@/layout/ScrollRestorer.jsx";
import RouteFocus from "@/layout/RouteFocus.jsx";
import RouteBoundary from "@/layout/RouteBoundary.jsx";
import { AnimatePresence, motion } from "framer-motion";

/**
 * RootLayout
 * - Global shell (wraps both public and authed routes if you want).
 * - High-contrast dark UI for glare sensitivity (photophobia) and colorblind safety.
 * - Skip link, focus management, scroll restoration, and an error boundary per-route.
 * - Optional route transitions (respecting reduced-motion).
 */
export default function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-dvh flex flex-col bg-slate-900 text-white antialiased">
      {/* Accessible skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3
                   focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2
                   focus:text-slate-900"
      >
        Skip to content
      </a>

      <header role="banner">
        <NavBar />
      </header>

      {/* Route UX helpers */}
      <ScrollRestorer />
      <RouteFocus />

      <main id="main" role="main" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          {/* Boundary resets on path change so errors don't stick across pages */}
          <RouteBoundary resetKey={location.pathname}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.section
                key={location.key || location.pathname}
                // Respect reduced motion: our MotionSafe component will no-op if user prefers reduced motion
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                aria-live="polite"
              >
                <Outlet />
              </motion.section>
            </AnimatePresence>
          </RouteBoundary>
        </div>
      </main>

      {/* TODO: Portals (toasts, modals, footers) can mount here */}
      {/* <Footer /> */}
      {/* <Toaster /> */}
    </div>
  );
}
