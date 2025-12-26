// src/components/AppFooter.jsx
// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";

export default function AppFooter() {
  const repoUrl = "https://github.com/Catfishfishcat10101/doggerz";
  return (
    <footer className="border-t border-emerald-500/15 bg-black/35 backdrop-blur-md">
      <div className="w-full max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-emerald-200">DOGGERZ</div>
          <div className="text-xs text-zinc-400">A cozy virtual pup sim.</div>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link className="text-emerald-200 hover:text-emerald-100" to="/about">
            About
          </Link>
          <Link className="text-emerald-200 hover:text-emerald-100" to="/help">
            Help
          </Link>
          <Link className="text-emerald-200 hover:text-emerald-100" to="/settings">
            Settings
          </Link>
          <a
            className="text-emerald-200 hover:text-emerald-100"
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="text-[0.75rem] text-zinc-500">
          © {new Date().getFullYear()} Doggerz
        </div>
      </div>
    </footer>
  );
}
