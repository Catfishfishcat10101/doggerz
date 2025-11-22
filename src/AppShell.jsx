// src/AppShell.jsx
// @ts-nocheck

import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import { Suspense, lazy } from "react";
import Brand from "@/components/Brand.jsx";
import Loader from "@/components/Loader.jsx";
import DevToolbar from "@/components/DevToolbar.jsx";
const Splash = lazy(() => import("./pages/Splash.jsx"));
const Landing = lazy(() => import("./pages/Landing.jsx"));
const Adopt = lazy(() => import("./pages/Adopt.jsx"));
const GamePage = lazy(() => import("./pages/Game.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Legal = lazy(() => import("./pages/Legal.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Memory = lazy(() => import("./pages/Memory.jsx"));
const Potty = lazy(() => import("./pages/PottyTraining.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-[10px] uppercase tracking-[0.28em] text-emerald-400/90">Virtual Pup</span>
          <Brand size="lg" />
        </Link>

        {onHome && (
          <nav className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/adopt")}
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-1.5 transition"
            >
              Adopt
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

function AppFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500 py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {year} Doggerz. Created by William Johnson.</p>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => navigate("/about")}
            className="hover:text-zinc-300"
          >
            About
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="hover:text-zinc-300"
          >
            Contact
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="hover:text-zinc-300"
          >
            Settings
          </button>
          <button
            onClick={() => navigate("/legal")}
            className="hover:text-zinc-300"
          >
            Terms &amp; Privacy
          </button>
        </nav>
      </div>
    </footer>
  );
}

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50">
      <AppHeader />

      <main className="flex-1">
        {import.meta.env.DEV && <DevToolbar />}
        <Suspense fallback={<Loader className="p-6" />}> 
        <Routes>
            {/* Primary entry – you can swap Splash ↔ Landing later if you want */}
          <Route path="/" element={<Splash />} />

          {/* Secondary marketing / info */}
          <Route path="/landing" element={<Landing />} />

          {/* Core game flow */}
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/game" element={<GamePage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Extras / sub-screens */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/potty" element={<Potty />} />

          {/* Friendly aliases / redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/play" element={<Navigate to="/game" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>

      <AppFooter />
    </div>
  );
}
