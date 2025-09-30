// src/components/UI/NavBar.jsx
import React, { useEffect, useMemo, useState, useId } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, userSignedOut } from "@/redux/userSlice";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

/**
 * Production-safe, accessible top nav.
 * - Desktop (public): Home + Privacy (left), Log in / Sign up (right)
 * - Desktop (authed): Game / Profile / Settings (left), User chip + Sign out (right)
 * - Mobile: drawer with everything; ESC/route-close + body scroll-lock
 */
export default function NavBar() {
  const user = useSelector(selectUser);
  const isAuthed = !!user?.uid;
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const mobileId = useId();

  const compact = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => setOpen(false), [pathname]); // close on route change
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    // body scroll-lock for mobile drawer
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = open ? "hidden" : prev || "";
    return () => { style.overflow = prev || ""; };
  }, [open]);

  async function onLogout() {
    try {
      await signOut(auth);
      dispatch(userSignedOut());
      nav("/");
    } catch (e) {
      console.error("Sign-out failed:", e);
    }
  }

  const linkBase =
    "px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150";
  const linkIdle = "text-white/90 hover:bg-white/10";
  const linkActive = "bg-white/15 text-white"; // swap to /20 if your Tailwind config dislikes /15

  const renderLink = (to, label) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl focus:outline-none focus-visible:ring focus-visible:ring-amber-300/40"
          aria-label="Doggerz home"
        >
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-300 to-pink-400 shadow-inner" />
          <span className="text-lg font-extrabold tracking-wide">Doggerz</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 sm:flex">
          {compact ? (
            // PUBLIC: only Home + Privacy here (no duplicate auth links)
            <>
              {renderLink("/", "Home")}
              {renderLink("/privacy", "Privacy")}
            </>
          ) : (
            // AUTHED: product nav
            <>
              {renderLink("/game", "Game")}
              {renderLink("/profile", "Profile")}
              {renderLink("/settings", "Settings")}
            </>
          )}
        </nav>

        {/* Right cluster: auth controls (desktop) */}
        <div className="hidden items-center gap-2 sm:flex">
          {isAuthed ? (
            <>
              <UserChip
                displayName={user.displayName}
                email={user.email}
                photoURL={user.photoURL}
              />
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-white/15 text-white hover:bg-white/25"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => nav("/login")}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => nav("/signup")}
                className="px-3 py-2 rounded-xl text-sm font-semibold bg-amber-400/90 text-slate-900 hover:bg-amber-300"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={mobileId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl p-2 text-white/90 hover:bg-white/10 sm:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden">
          <div
            id={mobileId}
            role="dialog"
            aria-modal="true"
            className="mx-3 mb-3 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur"
          >
            <div className="flex flex-col gap-2">
              {compact ? (
                <>
                  <NavItem to="/" label="Home" onClick={() => setOpen(false)} />
                  <NavItem to="/login" label="Log in" onClick={() => setOpen(false)} />
                  <NavItem to="/signup" label="Sign up" onClick={() => setOpen(false)} />
                  <NavItem to="/privacy" label="Privacy" onClick={() => setOpen(false)} />
                </>
              ) : (
                <>
                  <NavItem to="/game" label="Game" onClick={() => setOpen(false)} />
                  <NavItem to="/profile" label="Profile" onClick={() => setOpen(false)} />
                  <NavItem to="/settings" label="Settings" onClick={() => setOpen(false)} />
                </>
              )}

              <div className="mt-1 border-t border-white/10 pt-3">
                {isAuthed ? (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                    className="w-full rounded-xl bg-white/15 px-3 py-2 text-left text-sm font-medium hover:bg-white/25"
                  >
                    Sign out
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        nav("/login");
                        setOpen(false);
                      }}
                      className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        nav("/signup");
                        setOpen(false);
                      }}
                      className="flex-1 rounded-xl bg-amber-400/90 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------------- helpers/components -------------------------- */

function isPublicPath(pathname = "/") {
  if (pathname.startsWith("/privacy") || pathname.startsWith("/terms")) return true;
  return pathname === "/" || pathname === "/login" || pathname === "/signup";
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        "block rounded-xl px-3 py-2 text-sm font-medium " +
        (isActive ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10")
      }
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {label}
    </NavLink>
  );
}

function UserChip({ displayName, email, photoURL }) {
  const name = displayName || email || "You";
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 pr-3 pl-1 py-1">
      <Avatar src={photoURL} alt={name} />
      <span className="text-sm text-white/90 max-w-[16ch] truncate">{name}</span>
    </div>
  );
}

function Avatar({ src, alt }) {
  if (!src) {
    return (
      <div
        className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 text-xs font-bold text-white"
        aria-hidden="true"
        title={alt}
      >
        {initials(alt)}
      </div>
    );
  }
  return <img src={src} alt={alt} className="h-7 w-7 rounded-full object-cover" />;
}

function initials(t = "") {
  const parts = String(t).trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b || "U").toUpperCase();
}