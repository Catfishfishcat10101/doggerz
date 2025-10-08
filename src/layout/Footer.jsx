// src/components/UI/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-900/60 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/60">
          Doggerz — All rights reserved © 2025
        </p>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/privacy" className="text-white/70 hover:text-white">Privacy</Link>
       </nav>
      </div>
    </footer>
  );
}
