// src/pages/About.jsx
// @ts-nocheck

import React from "react";

export default function About() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            About Doggerz
          </h1>
          <p className="text-sm text-zinc-400">
            Doggerz is a time-based virtual pup companion inspired by real dogs
            that never stop needing you—even when life gets chaotic.
          </p>
        </header>

        <section className="space-y-4 text-sm text-zinc-300">
          <p>
            Every Doggerz pup has stats like hunger, happiness, energy, and
            cleanliness that tick over time. When you log back in, the game
            calculates what happened while you were away and updates your pup
            accordingly.
          </p>

          <p>
            The goal isn&apos;t just to keep the meters green—it&apos;s to
            build a long-term bond. Your care decisions, training streaks, and
            how quickly you respond to their needs all shape the dog&apos;s
            mood, lifespan, and story.
          </p>

          <p>
            Under the hood, Doggerz uses a real-time simulation loop powered by
            Redux and timestamp diffs to keep the world moving even when the
            app is closed.
          </p>

          <p className="text-xs text-zinc-500">
            Built as a passion project by William Johnson. Inspired by real
            pups and real late-night debugging sessions.
          </p>
        </section>
      </div>
    </main>
  );
}
