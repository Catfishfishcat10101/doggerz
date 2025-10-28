import React from "react";
import { Link } from "react-router-dom";
export default function AppFooter() {
  return (
    <footer className="border-t border-neutral-800/60 bg-neutral-950/70">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-neutral-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Doggerz. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link className="hover:text-amber-300" to="/privacy">Privacy</Link>
            <Link className="hover:text-amber-300" to="/terms">Terms</Link>
            <Link className="hover:text-amber-300" to="/status">Status</Link>
            <a className="hover:text-amber-300" href="https://github.com/Catfishfishcat10101/doggerz" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
