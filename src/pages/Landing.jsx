/** @format */
// src/pages/Landing.jsx

import PageShell from "@/components/PageShell.jsx";

export default function Landing() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-white/15 bg-black/35 backdrop-blur-md shadow-[0_0_90px_rgba(16,185,129,0.12)]">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="relative p-8 sm:p-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                Doggerz
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-100">
                Raise a pup through routines, training, and real choices.
              </h1>

              <p className="mt-4 max-w-2xl text-sm text-zinc-200/90 leading-relaxed">
                Progress is earned by showing up—feed, play, and train to build
                habits that shape your dog’s personality. Streaks unlock new
                looks and rewards over time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
