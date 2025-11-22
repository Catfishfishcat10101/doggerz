// src/AppShell.jsx
// @ts-nocheck

import React from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Splash from "@/pages/Splash.jsx";
import Landing from "@/pages/Landing.jsx";
import Adopt from "@/pages/Adopt.jsx";
import GamePage from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import About from "@/pages/About.jsx";
import Settings from "@/pages/Settings.jsx";
import Legal from "@/pages/Legal.jsx";
import NotFound from "@/pages/NotFound.jsx";
import Memory from "@/pages/Memory.jsx";
import Potty from "@/pages/PottyTraining.jsx";
import Contact from "@/pages/Contact.jsx";

// ---------------------------------------------------------
// Header
// ---------------------------------------------------------
function AppHeader() {
  const location = useLocation();
  const path = location.pathname || "/";

  const isOnLogin = path.startsWith("/login");
  const isOnAdopt = path.startsWith("/adopt");

  return (
    <header className="border-b border-zinc-900 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-lg font-black tracking-tight text-emerald-400 drop-shadow-[0_0_14px_rgba(16,185,129,0.9)]">
            DOGGERZ
          </span>
          <span className="hidden text-[0.7rem] uppercase tracking-[0.22em] text-zinc-500 sm:inline">
            virtual pup
          </span>
        </Link>

        {/* Right side: login + adopt */}
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/login"
            className={[
              "px-3 py-1.5 rounded-full border text-xs font-medium transition",
              isOnLogin
                ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                : "border-zinc-700 text-zinc-200 hover:border-emerald-400 hover:text-emerald-300",
            ].join(" ")}
          >
            Login
          </Link>

          <Link
            to="/adopt"
            className={[
              "px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-md",
              isOnAdopt
                ? "bg-emerald-400 text-slate-900 shadow-emerald-500/40"
                : "bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-emerald-500/30",
            ].join(" ")}
          >
            Adopt
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ---------------------------------------------------------
// Footer
// ---------------------------------------------------------
function AppFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-black/80 text-[0.7rem] text-zinc-500">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span>&copy; {new Date().getFullYear()} Doggerz.</span>
        <div className="flex gap-3">
          <Link
            to="/about"
            className="hover:text-emerald-300 transition-colors"
          >
            About
          </Link>
          {/* Potty training link removed from footer per design */}
          <Link
            to="/legal"
            className="hover:text-emerald-300 transition-colors"
          >
            Legal
          </Link>
          <Link
            to="/contact"
            className="hover:text-emerald-300 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------
// Layout shell
// ---------------------------------------------------------
function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

// ---------------------------------------------------------
// Routes
// ---------------------------------------------------------
export default function AppShell() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Home / splash */}
        <Route index element={<Splash />} />

        {/* Core game flow */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/adopt" element={<Adopt />} />
        <Route path="/game" element={<GamePage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Extra pages */}
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/potty" element={<Potty />} />
        <Route path="/contact" element={<Contact />} />

        {/* Legacy redirect if needed */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
