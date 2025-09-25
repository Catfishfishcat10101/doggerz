// src/components/UI/NavBar.jsx
import React, { memo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default memo(function NavBar({ className = "" }) {
  // Try to infer auth presence; won’t crash if slice isn’t wired yet
  const user = useSelector((s) => s?.user) || {};
  const isAuthed = Boolean(user?.id || user?.uid || user?.email);
  const loc = useLocation();

  // Treat these paths as “Game” active
  const gameActive = /^\/(game|train|shop|stats|breed|accessories)/i.test(
    loc.pathname || "/"
  );

  const base =
    "px-3 py-1 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
  const item = ({ isActive }) =>
    [
      base,
      isActive ? "bg-slate-700 text-white" : "bg-slate-800/40 hover:bg-slate-700 text-slate-200",
    ].join(" ");

  return (
    <header
      className={[
        "sticky top-0 z-40 backdrop-blur",
        "bg-slate-950/60 border-b border-slate-800",
        className,
      ].join(" ")}
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl px-1.5"
          aria-label="Go to home"
        >
          <img
            src="/icons/icon-192.png"
            alt=""
            className="h-6 w-6 rounded-lg"
          />
          <span>Doggerz</span>
        </Link>

        {/* Primary nav – horizontally scrollable on small screens */}
        <nav
          className="flex gap-2 overflow-x-auto scrollbar-none"
          aria-label="Primary"
        >
          <NavLink to="/" className={item} end>
            Splash
          </NavLink>

          {/* Force active style for “Game” across nested app routes */}
          <NavLink
            to="/game"
            className={({ isActive }) =>
              [
                base,
                (isActive || gameActive)
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800/40 hover:bg-slate-700 text-slate-200",
              ].join(" ")
            }
          >
            Game
          </NavLink>

          <NavLink to="/stats" className={item}>
            Stats
          </NavLink>

          <NavLink to="/shop" className={item}>
            Shop
          </NavLink>
        </nav>

        {/* Auth cluster */}
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <span className="hidden sm:inline text-xs text-slate-300">
                {user.displayName || user.email || "Player"}
              </span>
              <Link
                to="/game"
                className={base + " bg-emerald-600 hover:bg-emerald-500 text-white"}
              >
                Continue
              </Link>
              {/* Optional: route to a settings/profile page if/when you add it */}
              {/* <Link to="/profile" className={item}>Profile</Link> */}
            </>
          ) : (
            <>
              <Link to="/login" className={item}>
                Log in
              </Link>
              <Link
                to="/signup"
                className={base + " bg-sky-600 hover:bg-sky-500 text-white"}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
