// src/layout/Header.jsx
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Dog } from "lucide-react";

const NAV = [
  { to: "/game", label: "Game" },
  { to: "/stats", label: "Stats" },
  { to: "/shop", label: "Shop" },
];

export default function Header() {
  const location = useLocation();
  const onSplash = location.pathname === "/" || location.pathname === "/splash";

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Dog className="h-5 w-5" />
          <span>Doggerz</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm ${isActive ? "text-sky-600 dark:text-sky-400 font-medium" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Auth buttons are intentionally hidden on Splash to avoid duplicates */}
        {!onSplash && (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm px-3 py-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-700"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}