// src/components/UI/NavBar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Dog, Menu, X, LogIn, UserPlus, Download } from "lucide-react";

/**
 * Simple PWA-install hook: exposes an "install" action when eligible.
 * We intentionally hide this on Splash to avoid visual noise at first touch.
 */
function usePWAInstall() {
  const [deferred, setDeferred] = useState(null);
  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    setDeferred(null);
    return choice;
  };
  return { canInstall: !!deferred, install };
}

const NAV = [
  { to: "/game", label: "Game" },
  { to: "/stats", label: "Stats" },
  { to: "/shop", label: "Shop" },
];

export default function NavBar() {
  const { pathname } = useLocation();
  const onSplash = pathname === "/" || pathname === "/splash";
  const [open, setOpen] = useState(false);
  const { canInstall, install } = usePWAInstall();

  useEffect(() => setOpen(false), [pathname]); // close menu on navigation

  const linkBase =
    "text-sm px-2 py-1 rounded-md transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white";

  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-slate-800">
      <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
          <Dog className="h-5 w-5" />
          <span>Doggerz</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "text-sky-600 dark:text-sky-400 font-medium" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right-side CTAs (suppressed on Splash to prevent duplication) */}
        <div className="hidden md:flex items-center gap-2">
          {!onSplash && canInstall && (
            <button
              onClick={install}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900"
              title="Install app"
            >
              <Download className="h-4 w-4" />
              Install
            </button>
          )}
          {!onSplash && (
            <>
              <Link
                to="/login"
                className="text-sm px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-700 inline-flex items-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block ${linkBase} ${isActive ? "text-sky-600 dark:text-sky-400 font-medium" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}

            {!onSplash && canInstall && (
              <button
                onClick={install}
                className="mt-1 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Download className="h-4 w-4" />
                Install
              </button>
            )}

            {!onSplash && (
              <div className="mt-1 flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex-1 text-center text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center text-sm px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
