// src/components/UI/NavBar.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Probe optional selectors safely (fall back to raw state shape)
import * as userSlice from "../../redux/userSlice";
import * as dogSlice from "../../redux/dogSlice";

const selectUid = userSlice.selectUid || ((s) => s.user?.uid ?? null);
const doSignOut = userSlice.signOut || null;

const selectCoins =
  dogSlice.selectCoins || ((s) => Number(s.dog?.coins ?? 0));

export default function NavBar() {
  const dispatch = useDispatch();
  const uid = useSelector(selectUid);
  const coins = useSelector(selectCoins);
  const location = useLocation();

  const [open, setOpen] = useState(false);

  // close mobile menu on route change
  useEffect(() => setOpen(false), [location.pathname]);

  const base =
    "px-3 py-1.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40";
  const active = useCallback(
    ({ isActive }) =>
      `${base} ${
        isActive ? "bg-slate-700 text-white" : "bg-slate-800/40 text-slate-200 hover:bg-slate-700/70"
      }`,
    []
  );

  const navLinks = useMemo(
    () => [
      { to: "/", label: "Splash" },
      { to: "/game", label: "Game" },
      { to: "/shop", label: "Shop" },
      { to: "/stats", label: "Stats" },
    ],
    []
  );

  const onInstallPWA = () => {
    // If you wired a custom event in your PWAInstallPrompt, this will open it
    try {
      window.dispatchEvent(new CustomEvent("doggerz:pwa:prompt"));
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-950/70 border-b border-slate-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {/* Hamburger */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="block">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <Link to="/" className="font-semibold tracking-wide text-slate-100 hover:text-white">
              🐕‍🦺 Doggerz
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={active}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Coins pill */}
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              title="Coins"
            >
              <span aria-hidden>💰</span>
              <span className="font-mono text-sm tabular-nums">{Number(coins).toLocaleString()}</span>
            </div>

            {/* PWA Install (optional; no-op if you didn't wire the event) */}
            <button
              onClick={onInstallPWA}
              className="hidden sm:inline-flex px-2.5 py-1 rounded-xl text-xs bg-slate-800/40 text-slate-200 hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              title="Install App"
            >
              ⬇️ Install
            </button>

            {/* Auth */}
            {uid ? (
              <button
                onClick={() => doSignOut && dispatch(doSignOut())}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                title="Sign out"
              >
                Sign out
              </button>
            ) : (
              <>
                <NavLink to="/login" className={active}>Sign in</NavLink>
                <NavLink to="/signup" className={active}>Create</NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden pb-3 animate-in fade-in slide-in-from-top-2">
            <nav className="grid gap-2">
              {navLinks.map((l) => (
                <NavLink key={`m-${l.to}`} to={l.to} className={active}>
                  {l.label}
                </NavLink>
              ))}
              <div className="flex items-center justify-between mt-1">
                <button
                  onClick={onInstallPWA}
                  className={`${base} bg-slate-800/40 text-slate-200 hover:bg-slate-700/70`}
                >
                  ⬇️ Install
                </button>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  title="Coins"
                >
                  <span aria-hidden>💰</span>
                  <span className="font-mono text-sm tabular-nums">{Number(coins).toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-800 mt-2">
                {uid ? (
                  <button
                    onClick={() => doSignOut && dispatch(doSignOut())}
                    className="w-full px-3 py-2 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                  >
                    Sign out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <NavLink to="/login" className={active}>Sign in</NavLink>
                    <NavLink to="/signup" className={active}>Create</NavLink>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
