// src/components/AppHeader.jsx
// Main header for Doggerz app
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/" || location.pathname === "/splash";

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Doggerz
          </span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-emerald-400/90">
            Virtual Pup
          </span>
        </Link>
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <button
            onClick={() => navigate("/settings")}
            className="text-sm text-zinc-100 hover:text-white transition"
            title="Settings"
          >
            Settings
          </button>

          <button
            onClick={() => navigate("/about")}
            className="text-sm text-zinc-100 hover:text-white transition"
          >
            About
          </button>

          {!onHome && (
            <button
              onClick={() => navigate("/")}
              className="text-sm text-zinc-100 hover:text-white transition"
            >
              Home
            </button>
          )}

          {/* Keep prominent CTAs on the right */}
          <div className="ml-2 flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-zinc-100 hover:text-white transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/adopt")}
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-1.5 transition"
            >
              Adopt
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
