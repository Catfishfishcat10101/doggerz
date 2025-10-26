import React from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@/config/routes.js";

export default function NavBar() {
  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-3">
        <Link to={PATHS.home} className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Doggerz
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to={PATHS.game} className="hover:underline">
            Game
          </Link>
          <Link to={PATHS.shop} className="hover:underline">
            Shop
          </Link>
          <Link to={PATHS.settings} className="hover:underline">
            Settings
          </Link>
          <Link
            to={PATHS.login}
            className="rounded px-3 py-1.5 border border-white/20 hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
