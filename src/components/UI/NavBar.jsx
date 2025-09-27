<<<<<<< Updated upstream
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/userSlice.js";

export default function NavBar() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user.user); // null or { displayName, email }
  const dogName = useSelector((s) => s.dog.name ?? "Pupper");

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => nav("/")}
          className="font-black tracking-wide text-lg select-none"
          aria-label="Doggerz Home"
        >
          DOGGERZ<span className="ml-2 text-xs font-semibold opacity-70">Beta</span>
        </button>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={({ isActive }) => linkCx(isActive)}>Home</NavLink>
          <NavLink to="/game" className={({ isActive }) => linkCx(isActive)}>Game</NavLink>
          <NavLink to="/shop" className={({ isActive }) => linkCx(isActive)}>Shop</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs opacity-80">Pup: {dogName}</span>
          {user ? (
            <button
              onClick={() => dispatch(logout())}
              className="btn-primary"
            >
              Sign out
            </button>
          ) : (
            <button onClick={() => nav("/game")} className="btn-primary">
              Play Now
            </button>
          )}
        </div>
=======
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const base =
  "px-3 py-2 rounded-lg text-sm font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2";
const idle = "text-white/90";
const active = "bg-white/10 text-white";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/", label: "Home", end: true },
    { to: "/game", label: "Game" },
    { to: "/shop", label: "Shop" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-zinc-900/70 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Doggerz Home">
            <span className="inline-block h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 shadow" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Doggerz</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => `${base} ${isActive ? active : idle}`}
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              className="ml-1 px-3 py-2 rounded-lg text-sm font-semibold bg-white text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Sign in
            </Link>
          </nav>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Toggle menu</span>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div id="mobile-menu" className="md:hidden pb-3">
            <div className="flex flex-col gap-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `mx-1 ${base} ${isActive ? active : idle}`}
                >
                  {n.label}
                </NavLink>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mx-1 px-3 py-2 rounded-lg text-sm font-semibold bg-white text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
>>>>>>> Stashed changes
      </div>
    </header>
  );
}
<<<<<<< Updated upstream

function linkCx(active) {
  return [
    "px-2 py-1 rounded-md",
    active ? "bg-white/10" : "hover:bg-white/5"
  ].join(" ");
}
=======
>>>>>>> Stashed changes
