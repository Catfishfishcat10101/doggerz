// src/pages/Affection.jsx
// @ts-nocheck

import React from "react";

export default function Affection() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Affection &amp; Bonding
          </h1>
          <p className="text-sm text-zinc-400">
            This page will evolve into a deep dive on how your pup forms a bond
            with you across sessions.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 text-sm text-zinc-300">
          <p>
            Affection systems can track favorite toys, reactions to how often
            you visit, and how you respond when needs go unmet. Over time, this
            will give each Doggerz pup its own personality curve.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            For now, consider this a placeholder. The underlying temperament and
            memory systems are under active construction.
          </p>
        </section>
      </div>
    </main>
  );
}
