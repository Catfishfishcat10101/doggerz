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
                AI-powered dog behavior that learns your patterns.
              </h1>

              <p className="mt-4 max-w-2xl text-sm text-zinc-200/90 leading-relaxed">
                Your pup feels delightfully unpredictable, but the engine is
                watching your routines. It learns when you engage and drops
                playful, “random” moments at the perfect time.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-6 shadow-[0_0_60px_rgba(14,165,233,0.08)]">
            <h2 className="text-lg font-bold text-emerald-200">
              Behavior brief
            </h2>
            <p className="mt-3 text-sm text-zinc-200/90 leading-relaxed">
              The dog appears to do random things, but it’s intentional. We
              learn player patterns and schedule bursts of chaos when they’re
              most likely to smile, tap, and play longer.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/35 p-6">
            <h2 className="text-lg font-bold text-emerald-200">
              Core features
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-200/90 list-disc pl-5">
              <li>Pattern learning across time of day and session length.</li>
              <li>Controlled randomness with weighted behavior clips.</li>
              <li>Surprise engine that triggers rare, memorable moments.</li>
              <li>Behavior library with cooldowns and context rules.</li>
              <li>Feedback taps to personalize the behavior mix.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/35 p-6">
            <h2 className="text-lg font-bold text-emerald-200">
              Why it’s interesting
            </h2>
            <p className="mt-3 text-sm text-zinc-200/90 leading-relaxed">
              It’s unpredictable enough to feel alive, but grounded in your
              habits so the fun lands when it matters.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
