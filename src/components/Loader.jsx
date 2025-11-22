// src/components/Loader.jsx
// @ts-nocheck

import React from "react";

export default function Loader({ label = "Loading…", className = "" }) {
  return (
    <div className={["flex items-center gap-3 p-6 text-zinc-300", className].join(" ")}>
      <svg className="h-5 w-5 animate-spin text-emerald-400" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}
