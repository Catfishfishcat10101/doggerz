// src/components/AppHeader.jsx
// @ts-nocheck

import { NavLink } from "react-router-dom";
import nav from "@/nav.js";

function NavPill({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2 text-sm font-bold transition select-none",
          "border",
          isActive
            ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            : "bg-black/25 text-zinc-200 border-white/10 hover:bg-black/40 hover:border-emerald-400/25",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-emerald-500/15 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-[220px]">
            <NavLink to="/" className="leading-tight">
              <div className="text-emerald-700 font-extrabold tracking-[0.38em] text-xs">
                D O G G E R Z
              </div>
              <div className="text-zinc-500 text-xs">Adopt. Train. Bond.</div>
            </NavLink>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {nav?.map((item) => (
              <NavPill key={item.to} to={item.to}>
                {item.label}
              </NavPill>
            ))}
          </nav>

          {/* Mobile: simple compact pills */}
          <nav className="flex md:hidden items-center gap-2">
            <NavPill to="/">Home</NavPill>
            <NavPill to="/game">Play</NavPill>
          </nav>
        </div>
      </div>
    </header>
  );
}
