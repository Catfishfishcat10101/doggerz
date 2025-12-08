// @ts-nocheck
// src/AppShell.jsx

import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AppBackground from "@/components/AppBackground.jsx";
import "../utils/announcer.js";
import ToastContainer from "@/components/ToastContainer.jsx";
import RainbowBridge from "@/components/RainbowBridge.jsx";


/**
 * AppShell
 * - Wraps all routes in the dynamic background
 * - Provides a Doggerz-branded header and footer
 */
export default function AppShell() {
  const currentYear = new Date().getFullYear();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 240);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global toast action handler: map toast actions to navigation or other
  // app-level behaviors. Listens for CustomEvent('app-toast-action') which
  // is emitted by the ToastContainer when action buttons are clicked.
  useEffect(() => {
    function safeNavigate(to) {
      try {
        navigate(to);
      } catch (e) {
        window.location.href = to;
      }
    }
    function onToastAction(e) {
      const detail = e?.detail || {};
      const id = detail.id;
      if (!id) return;
      // Map toast action ids to route paths
      if (id === "view-journal") return safeNavigate("/journal");
      if (id === "view-memorials") return safeNavigate("/memorials");
      if (id === "view-settings") return safeNavigate("/settings");
      // fallback: dispatch a generic navigate event for other consumers
      try {
        const navEvent = new CustomEvent("app-navigate", { detail: { id } });
        window.dispatchEvent(navEvent);
      } catch (err) { }
    }

    window.addEventListener("app-toast-action", onToastAction);
    return () => window.removeEventListener("app-toast-action", onToastAction);
  }, []);



  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppBackground zipCode="65401">
      <div className="min-h-screen flex flex-col">
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-emerald-800 text-white px-3 py-1 rounded"
        >
          Skip to content
        </a>
        {/* ARIA live region (polite) - also created by announcer util if missing */}
        <div id="app-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        {/* Header (responsive) inserted below */}
        <header className="w-full border-b border-emerald-500/40 bg-black/60 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 drop-shadow">
                  Doggerz
                </span>
                <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-300">
                  Virtual Pup
                </span>
              </div>
              <span className="hidden sm:inline text-xs text-emerald-200 px-3 py-1 rounded-full border border-emerald-500/60 bg-emerald-900/40">
                Be kind to your real dogs.
              </span>
            </div>

            <nav className="flex items-center gap-3">
              <button
                aria-expanded={mobileOpen}
                aria-controls="site-nav"
                className="sm:hidden px-3 py-2 rounded bg-emerald-700/30 hover:bg-emerald-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                onClick={() => setMobileOpen((s) => !s)}
                title="Toggle menu"
              >
                <span className="sr-only">Toggle navigation</span>
                {mobileOpen ? "✕" : "☰"}
              </button>

              <div id="site-nav" className={`hidden sm:flex gap-3 text-sm`}>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    (isActive ? "text-emerald-200 underline" : "text-emerald-100 hover:underline") + " px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                  }
                >
                  Play
                </NavLink>
                <NavLink
                  to="/adopt"
                  className={({ isActive }) =>
                    (isActive ? "text-emerald-200 underline" : "text-emerald-100 hover:underline") + " px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                  }
                >
                  Adopt
                </NavLink>
                <NavLink
                  to="/memorials"
                  className={({ isActive }) =>
                    (isActive ? "text-emerald-200 underline" : "text-emerald-100 hover:underline") + " px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                  }
                >
                  Memorials
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    (isActive ? "text-emerald-200 underline" : "text-emerald-100 hover:underline") + " px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                  }
                >
                  Settings
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    (isActive ? "text-emerald-200 underline" : "text-emerald-100 hover:underline") + " px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
                  }
                >
                  About
                </NavLink>
              </div>
            </nav>
          </div>

          {/* Mobile nav panel (animated) */}
          <div
            id="mobile-nav-panel"
            className={`sm:hidden bg-black/70 border-t border-emerald-600/20 overflow-hidden transition-all duration-300 ease-out ${mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
            aria-hidden={!mobileOpen}
          >
            <div className={`px-4 py-3 flex flex-col gap-2 transform transition-transform duration-200 ${mobileOpen ? 'translate-y-0' : '-translate-y-2'}`}>
              <NavLink to="/" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'text-emerald-200' : 'text-emerald-100'}>Play</NavLink>
              <NavLink to="/adopt" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'text-emerald-200' : 'text-emerald-100'}>Adopt</NavLink>
              <NavLink to="/memorials" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'text-emerald-200' : 'text-emerald-100'}>Memorials</NavLink>
              <NavLink to="/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'text-emerald-200' : 'text-emerald-100'}>Settings</NavLink>
              <NavLink to="/about" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'text-emerald-200' : 'text-emerald-100'}>About</NavLink>
            </div>
          </div>
        </header>

        {/* Main routed content */}
        <main id="main-content" className="flex-1 flex flex-col items-stretch">
          {/* Routes are rendered inside here */}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-emerald-500/40 bg-black/70 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-300 flex items-center justify-between gap-2">
            <span>© {currentYear} Doggerz — All Rights Reserved.</span>
            <span className="hidden sm:inline text-emerald-300">v1 · Green & Black Edition</span>
          </div>
        </footer>

        {/* Back to top button (animated) */}
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className={`fixed right-4 bottom-4 bg-emerald-600 text-white px-3 py-2 rounded-full shadow-lg transition-transform transition-opacity duration-300 ${showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'}`}
        >
          ↑ Top
        </button>
        {/* Toasts */}
        <ToastContainer />
        <RainbowBridge />

      </div>
    </AppBackground>
  );
}
