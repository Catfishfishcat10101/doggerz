import React from "react";
import { Link, NavLink } from "react-router-dom";
function NavItem({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      ["px-3 py-2 text-sm font-medium rounded-lg transition", isActive ? "bg-amber-400 text-black" : "text-neutral-200 hover:text-white hover:bg-neutral-800/60"].join(" ")
    }>
      {children}
    </NavLink>
  );
}
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-400" aria-hidden />
          <span className="font-semibold tracking-tight">Doggerz</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/game">Game</NavItem>
          <NavItem to="/shop">Shop</NavItem>
          <NavItem to="/settings">Settings</NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => {
            const root = document.documentElement;
            const isDark = root.dataset.theme !== "light";
            root.dataset.theme = isDark ? "light" : "dark";
          }} className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800/50" aria-label="Toggle theme" title="Toggle theme">Theme</button>
          <Link to="/auth" className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800/50">Sign In</Link>
        </div>
      </div>
    </header>
  );
}
