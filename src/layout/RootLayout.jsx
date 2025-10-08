import React from "react";
import { Outlet, Link } from "react-router-dom";

function NavBar() {
  return (
    <header className="border-b border-zinc-800">
      <div className="container text-zinc-400 mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/">Doggerz</Link>
        <nav className="flex gap-4 text-zinc-600">
          <Link to="/game">Game</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-8">
      <div className="container mx-auto px-4 py-6 text-xs text-zinc-400">
        Doggerz © 2025 Copyright.
      </div>
    </footer>
  );
}

export default function RootLayout() {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-black text-zinc-100">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
