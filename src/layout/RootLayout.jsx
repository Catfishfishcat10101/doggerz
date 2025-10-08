// src/layout/RootLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import NavBar from "@/components/UI/NavBar.jsx";
import ScrollRestorer from "@/layout/ScrollRestorer.jsx";
import RouteFocus from "@/layout/RouteFocus.jsx";
import RouteBoundary from "@/layout/RouteBoundary.jsx";
import Footer from "@/components/UI/Footer.jsx";

export default function RootLayout() {
  const location = useLocation();
  const reduce = useReducedMotion(); // honors OS “Reduce motion”

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
                key={location.pathname} // stable across query/hash changes
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={reduce ? undefined : { duration: 0.18, ease: "easeOut" }}
                aria-live="polite"
              >
                <Outlet />
              </motion.section>
            </AnimatePresence>
          </RouteBoundary>
        </div>
      </main>

      <Footer />
    </div>
  );
}
