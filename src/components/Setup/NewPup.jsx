// src/components/Setup/NewPup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/**
 * Simple first-run setup:
 * - lets the player name their pup
 * - stores it in localStorage (no Firebase needed)
 * - routes to /play
 */
export default function NewPup() {
  const nav = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem("dogName") || "");

  function onSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("dogName", trimmed);
    nav("/play");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="max-w-3xl mx-auto px-6 pt-10 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold tracking-wide text-slate-300">DOGGERZ</Link>
        <div className="text-xs text-slate-400">Doggerz 2025 · Be kind to your dogs.</div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-extrabold">Name your pup</h1>
        <p className="mt-2 text-slate-300">This is what your pixel buddy will be called in game.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fireball"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 font-semibold"
              disabled={!name.trim()}
            >
              Continue
            </button>
            <Link
              to="/"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-8 rounded-2xl p-6 bg-slate-900/60 border border-slate-800">
          <div className="text-sm text-slate-400">
            Tip: you can change the name later. We’ll sync to the cloud when you sign in.
          </div>
        </div>
      </main>
    </div>
  );
}
