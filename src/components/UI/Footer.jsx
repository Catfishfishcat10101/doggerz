import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 text-xs text-white/80 flex items-center justify-between">
        <span aria-label="Doggerz footer signature" className="font-semibold tracking-wide">
          dogerz@2025
        </span>
        <span className="opacity-70">
          Built with React • Redux Toolkit • Vite • PWA
        </span>
      </div>
    </footer>
  );
}