import React from "react";

export default function BackgroundScene({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
