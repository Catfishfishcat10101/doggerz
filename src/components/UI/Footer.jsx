// src/components/UI/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-top border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <span className="h-4 w-4 rounded-md bg-gradient-to-br from-amber-300 to-pink-400" />
          <span>Doggerz 2025</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/privacy" className="text-white/80 hover:text-white">Privacy</Link>
          <Link to="/terms" className="text-white/80 hover:text-white">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
