// src/App.jsx
// @ts-nocheck

import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Splash from "@/pages/Splash.jsx";
import Landing from "@/pages/Landing.jsx";
import Adopt from "@/pages/Adopt.jsx";
import GamePage from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx"; // still routed, just not linked in header
import About from "@/pages/About.jsx";
import Settings from "@/pages/Settings.jsx";
import Legal from "@/pages/Legal.jsx";
import NotFound from "@/pages/NotFound.jsx";
import Memory from "@/pages/Memory.jsx";
import Potty from "@/pages/Potty.jsx";
import Contact from "@/pages/Contact.jsx";

import { selectIsLoggedIn } from "@/redux/userSlice.js";

// --------------------------------------------------------
// Layout pieces
// --------------------------------------------------------

function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Treat both / and /landing as “home marketing” views
  const onHome =
    location.pathname === "/" || location.pathname === "/landing";

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex flex-col leading-none text-left"
        >
          <span className="text-[11px] uppercase tracking-[0.28em] text-emerald-400/90">
            Virtual Pup
          </span>
          <span className="text-[30px] sm:text-[32px] font-extrabold tracking-tight text-white">
            Doggerz
          </span>
        </button>

        {/* Right side nav */}
        <nav className="flex items-center gap-3">
          {!isLoggedIn && (
            <>
              {/* Marketing header: only on home/landing we show Login + Adopt */}
              {onHome && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-sm text-zinc-400 hover:text-white transition"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/adopt")}
                    className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-1.5 transition"
                  >
                    Adopt
                  </button>
                </>
              )}
            </>
          )}

          {isLoggedIn && (
            <>
              <button
                type="button"
                onClick={() => navigate("/game")}
                className="text-sm text-zinc-300 hover:text-white transition"
              >
                Play
              </button>
              <button
                type="button"
                onClick={() => navigate("/potty")}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition"
              >
                Potty training
              </button>
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                Settings
              </button>
            </>
          )}
        </nav>
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
            type="button"
            onClick={() => navigate("/about")}
            className="hover:text-zinc-300"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => navigate("/contact")}
            className="hover:text-zinc-300"
          >
            Contact
          </button>
          {/* Potty training link moved to header (auth-only) */}
          <button
            type="button"
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

// --------------------------------------------------------
// Route shell
// --------------------------------------------------------

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50">
      <AppHeader />

      <main className="flex-1">
        <Routes>
          {/* HOME = Landing hero */}
          <Route path="/" element={<Landing />} />

          {/* Optional splash */}
          <Route path="/splash" element={<Splash />} />
          <Route path="/landing" element={<Landing />} />

          {/* Core game flow */}
          <Route path="/adopt" element={<Adopt />} />
          <Route path="/game" element={<GamePage />} />

          {/* Auth (sign-up still exists as a route but we’re not advertising it in the hero/header) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Info / extras */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/potty" element={<Potty />} />

          {/* Friendly aliases */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/play" element={<Navigate to="/game" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AppFooter />
    </div>
  );
}

// --------------------------------------------------------
// Root App
// --------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
