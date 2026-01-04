// src/components/Header.jsx
// Single header used across the app (nav pills + halo styling).
// @ts-nocheck

import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import nav from "@/nav.js";
import { selectIsLoggedIn } from "@/redux/userSlice.js";

function NavPill({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2 text-sm font-bold transition select-none",
          "border",
          isActive
            ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/60 shadow-[0_0_24px_rgba(16,185,129,0.45)]"
            : "bg-black/35 text-white border-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:bg-black/45 hover:border-emerald-400/50",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const showSettings = location.pathname === "/settings";
  const filteredNav = React.useMemo(() => {
    if (isHome) {
      return [
        { label: "FAQs", to: "/faq" },
        { label: "Help", to: "/help" },
        { label: "Settings", to: "/settings" },
      ];
    }

    return (nav || []).filter((item) => {
      if (item.to === "/game") return isLoggedIn;
      if (item.to === "/settings") return showSettings;
      return true;
    });
  }, [isHome, isLoggedIn, showSettings]);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-emerald-500/15 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-[220px]">
            <NavLink to="/" className="leading-tight">
              <div className="text-emerald-600 font-extrabold tracking-[0.42em] text-sm sm:text-base">
                D O G G E R Z
              </div>
              <div className="text-zinc-500 text-xs sm:text-sm">Adopt. Train. Bond.</div>
            </NavLink>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {filteredNav.map((item) => (
              <NavPill key={item.to} to={item.to}>
                {item.label}
              </NavPill>
            ))}
          </nav>

          {/* Mobile: simple compact pills */}
          <nav className="flex md:hidden flex-wrap items-center gap-2">
            {filteredNav.slice(0, 3).map((item) => (
              <NavPill key={item.to} to={item.to}>
                {item.label}
              </NavPill>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
