// src/pages/About.jsx
import React from "react";
import PageShell from "@/components/PageShell.jsx";

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            About
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            How Doggerz works
          </h1>
          <p className="text-sm text-zinc-700 dark:text-white/70 max-w-2xl">
            Doggerz is a real-time virtual pup sim. Your choices influence stats,
            temperament, and behavior — even while you're away.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-4 dark:border-white/10 dark:bg-black/20">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white/90">Core loop</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700 dark:text-white/75">
            <li>Feed, play, and train to keep your pup thriving.</li>
            <li>Stay clean — neglect can lead to fleas, mange, and a bad mood.</li>
            <li>
              Your dog will auto-sleep when tired. Let them rest and they'll bounce back.
            </li>
            <li>
              Take regular potty breaks to reduce accidents and speed up potty training.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-2 dark:border-white/10 dark:bg-black/20">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white/90">Aging &amp; life</h2>
          <p className="text-sm text-zinc-700 dark:text-white/75">
            Time in Doggerz is accelerated: your pup ages faster than real time.
            With good care, they can live a long, happy life. Ignore them for days
            and needs will spiral.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-2 dark:border-white/10 dark:bg-black/20">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white/90">Potty training</h2>
          <p className="text-sm text-zinc-700 dark:text-white/75">
            Successful outdoor potty trips increase training. Hit 100% and indoor
            accidents become rare.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
