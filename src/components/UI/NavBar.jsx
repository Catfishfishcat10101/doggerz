// src/components/UI/NavBar.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
  const base =
    "px-3 py-1 rounded-xl text-sm hover:bg-slate-700 transition-colors";
  const active = ({ isActive }) =>
    `${base} ${isActive ? "bg-slate-700" : "bg-slate-800/40"}`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-950/60 border-b border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-wide">
          🐕‍🦺 Doggerz
        </Link>
        <nav className="flex gap-2">
          <NavLink to="/" className={active}>
            Splash
          </NavLink>
          <NavLink to="/game" className={active}>
            Game
          </NavLink>
          <NavLink to="/auth" className={active}>
            Sign in
          </NavLink>
        </nav>
      </div>
    </header>
  );
}