// src/components/UI/NavBar.jsx
import React, { memo, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/* ---------- tiny inline icons (no deps) ---------- */
const iconProps = { width: 18, height: 18, stroke: "currentColor", fill: "none", strokeWidth: 2 };
const DogIcon      = (p) => (<svg {...iconProps} {...p} viewBox="0 0 24 24"><path d="M3 10l2-2 3 2 3-2 3 2 2-2 2 2v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/></svg>);
const MenuIcon     = (p) => (<svg {...iconProps} {...p} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>);
const XIcon        = (p) => (<svg {...iconProps} {...p} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>);
const LogInIcon    = (p) => (<svg {...iconProps} {...p} viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>);
const UserPlusIcon = (p) => (<svg {...iconProps} {...p} viewBox="0 0 24 24"><path d="M15 19a6 6 0 0 0-12 0"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>);
const DownloadIcon = (p) => (<svg {...iconProps} {...p} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>);

/* ---------- minimal PWA install hook ---------- */
function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setEvt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);
  const install = async () => {
    if (!evt) return;
    evt.prompt();
    await evt.userChoice;
    setCanInstall(false);
    setEvt(null);
  };
  return { canInstall, install };
}

export default memo(function NavBar({ className = "" }) {
  const user = useSelector((s) => s?.user) || {};
  const isAuthed = Boolean(user?.id || user?.uid || user?.email);
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const { canInstall, install } = usePWAInstall();

  const base =
    "px-3 py-1 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
  const navClass = ({ isActive }) =>
    `${base} ${isActive ? "bg-slate-700 text-white" : "bg-slate-800/40 hover:bg-slate-700 text-slate-200"}`;
  const gameActive = /^\/(game|train|shop|stats|breed|accessories)/i.test(loc.pathname || "/");

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur bg-slate-950/60 border-b border-slate-800 ${String(
        className || ""
      )}`}
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl px-1.5"
          aria-label="Go to home"
        >
          <img src="/icons/icon-192.png" alt="" className="h-6 w-6 rounded-lg" />
          <span className="hidden sm:inline">Doggerz</span>
          <DogIcon className="sm:hidden" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-2" aria-label="Primary">
          <NavLink to="/" className={navClass} end>Splash</NavLink>
          <NavLink
            to="/game"
            className={({ isActive }) =>
              `${base} ${isActive || gameActive ? "bg-slate-700 text-white" : "bg-slate-800/40 hover:bg-slate-700 text-slate-200"}`
            }
          >
            Game
          </NavLink>
          <NavLink to="/stats" className={navClass}>Stats</NavLink>
          <NavLink to="/shop" className={navClass}>Shop</NavLink>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {canInstall && (
            <button
              onClick={install}
              className={`${base} bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2`}
              title="Install app"
            >
              <DownloadIcon /> Install
            </button>
          )}
          {isAuthed ? (
            <Link to="/game" className={`${base} bg-sky-600 hover:bg-sky-500 text-white`}>Continue</Link>
          ) : (
            <>
              <Link to="/login" className={`${base} bg-slate-800/40 hover:bg-slate-700 text-slate-200 inline-flex items-center gap-2`}>
                <LogInIcon /> Log in
              </Link>
              <Link to="/signup" className={`${base} bg-sky-600 hover:bg-sky-500 text-white inline-flex items-center gap-2`}>
                <UserPlusIcon /> Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg bg-slate-800/40 hover:bg-slate-700 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/90 backdrop-blur">
          <nav className="px-4 py-3 flex flex-col gap-2" aria-label="Primary mobile">
            <NavLink to="/" className={navClass} end onClick={() => setOpen(false)}>Splash</NavLink>
            <NavLink
              to="/game"
              className={({ isActive }) =>
                `${base} ${isActive || gameActive ? "bg-slate-700 text-white" : "bg-slate-800/40 hover:bg-slate-700 text-slate-200"}`
              }
              onClick={() => setOpen(false)}
            >
              Game
            </NavLink>
            <NavLink to="/stats" className={navClass} onClick={() => setOpen(false)}>Stats</NavLink>
            <NavLink to="/shop" className={navClass} onClick={() => setOpen(false)}>Shop</NavLink>

            <div className="h-px bg-slate-800 my-2" />

            {canInstall && (
              <button
                onClick={() => { install(); setOpen(false); }}
                className={`${base} bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-2`}
              >
                <DownloadIcon /> Install
              </button>
            )}

            {isAuthed ? (
              <Link to="/game" className={`${base} bg-sky-600 hover:bg-sky-500 text-white`} onClick={() => setOpen(false)}>
                Continue
              </Link>
            ) : (
              <>
                <Link to="/login" className={`${base} bg-slate-800/40 hover:bg-slate-700 text-slate-200 inline-flex items-center gap-2`} onClick={() => setOpen(false)}>
                  <LogInIcon /> Log in
                </Link>
                <Link to="/signup" className={`${base} bg-sky-600 hover:bg-sky-500 text-white inline-flex items-center gap-2`} onClick={() => setOpen(false)}>
                  <UserPlusIcon /> Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
});
