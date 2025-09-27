import React from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const Tab = ({ to, children }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={clsx(
        "px-3 py-2 rounded-xl transition",
        active ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
};

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-ink/50 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-black tracking-tight text-lg">
          Doggerz <span className="badge ml-2">PWA</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          <Tab to="/">Home</Tab>
          <Tab to="/game">Game</Tab>
          <Tab to="/shop">Shop</Tab>
          {/* auth slot; wire to Firebase later */}
          <button className="btn btn-ghost ml-2">Sign in</button>
        </nav>
      </div>
    </header>
  );
}