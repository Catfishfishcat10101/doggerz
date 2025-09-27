import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        {/* Brand */}
        <Link to="/" className="select-none">
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Doggerz
          </span>
        </Link>

        <div className="flex-1" />

        {/* Primary nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/game">Game</NavItem>
          <NavItem to="/shop">Shop</NavItem>
        </nav>

        {/* Auth */}
        <Link
          to="/login"
          className="rounded-xl px-3 py-1.5 bg-white text-black font-semibold hover:bg-neutral-200 transition"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-xl transition",
          isActive ? "bg-white/15" : "hover:bg-white/10",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}