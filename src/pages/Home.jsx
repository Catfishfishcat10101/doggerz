// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-emerald-50 to-emerald-100">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-emerald-900">
            Meet <span className="underline decoration-wavy decoration-orange-500">Doggerz</span>
          </h1>
          <p className="mt-3 text-emerald-800/80">
            A cozy, offline-friendly pixel pup sim. Train. Bark. Brag.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/game"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-95 shadow"
            >
              ▶ Start Game
            </Link>
            <Link
              to="/train/tricks"
              className="px-4 py-2.5 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
            >
              🎓 Try Tricks
            </Link>
            <Link
              to="/shop"
              className="px-4 py-2.5 rounded-xl bg-white border hover:bg-slate-50 active:scale-95"
            >
              🛒 Visit Shop
            </Link>
          </div>
        </header>

        {/* Feature grid */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Card
            title="Zero-friction"
            body="Instant boot via Vite. Progressive Web App so your pup’s never far."
            emoji="⚡"
          />
          <Card
            title="Cloud synced"
            body="Autosave to Firestore per-user. Your dog, your data."
            emoji="☁️"
          />
          <Card
            title="Play anywhere"
            body="Keyboard, touch D-pad, and gamepad-aware. Inclusive by design."
            emoji="🎮"
          />
        </div>

        {/* Deep links */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Tile to="/stats" label="📊 Stats" desc="Progress & achievements" />
          <Tile to="/accessories" label="🧢 Accessories" desc="Hats, bandanas, drip" />
          <Tile to="/breed" label="🐶 Breeding" desc="Next-gen pups (work-in-progress)" />
          <Tile to="/train/potty" label="🚽 Potty Trainer" desc="Positive reinforcement loop" />
          <Tile to="/train/tricks" label="🎓 Tricks Trainer" desc="Learn sit, roll, bark+" />
          <Tile to="/login" label="🔐 Sign In" desc="Sync your progress" />
        </div>

        {/* Version footer */}
        <p className="mt-10 text-center text-xs text-emerald-900/60">
          Build v{typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev"} • Vite + React • PWA-ready
        </p>
      </section>
    </div>
  );
}

function Card({ title, body, emoji }) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-4">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-2 font-semibold text-emerald-900">{title}</h3>
      <p className="mt-1 text-sm text-emerald-900/70">{body}</p>
    </div>
  );
}

function Tile({ to, label, desc }) {
  return (
    <Link
      to={to}
      className="rounded-xl bg-white border p-4 hover:shadow-md active:scale-95 transition"
    >
      <div className="font-semibold text-emerald-900">{label}</div>
      <div className="text-sm text-emerald-900/70">{desc}</div>
    </Link>
  );
}
