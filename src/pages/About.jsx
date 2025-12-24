// src/pages/About.jsx
// @ts-nocheck
import React from "react";

export default function About() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-emerald-300 tracking-wide">
          About Doggerz
        </h1>

        <p className="mt-3 text-zinc-300 leading-relaxed">
          Doggerz is a virtual pup simulator focused on bonding and training —
          not an idle clicker. You adopt one dog, care for it, potty-train it,
          and unlock trick training as you progress.
        </p>

        <section className="mt-8 rounded-2xl border border-emerald-500/15 bg-white/5 p-5">
          <h2 className="text-lg font-bold text-emerald-200">
            Core principles
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-300 list-disc pl-5">
            <li>Action-based gameplay (your choices drive outcomes).</li>
            <li>Potty training gates trick training.</li>
            <li>Clear, readable UI with a dark + neon accent style.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
