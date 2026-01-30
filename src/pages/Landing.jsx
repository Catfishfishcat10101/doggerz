/** @format */
// src/pages/Landing.jsx

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PageShell from "@/components/PageShell.jsx";
import { PATHS } from "@/routes.js";
import { selectDog } from "@/redux/dogSlice.js";

export default function Landing() {
  const dog = useSelector(selectDog);
  const hasDog = Boolean(dog && (dog.name || dog.createdAt || dog.stage));

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-white/15 bg-black/35 backdrop-blur-md shadow-[0_0_90px_rgba(16,185,129,0.12)]">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
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

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {hasDog ? (
                  <Link
                    to={PATHS.GAME}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
                  >
                    Continue to yard
                  </Link>
                ) : (
                  <Link
                    to={PATHS.ADOPT}
                    className="rounded-2xl px-4 py-2 text-sm font-semibold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
                  >
                    Adopt your pup
                  </Link>
                )}
                <Link
                  to={PATHS.LOGIN}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                >
                  {hasDog ? "Switch account" : "Login"}
                </Link>
                <a
                  href="#how"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/10 text-zinc-200 hover:bg-black/20 transition"
                >
                  How it works
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-zinc-300">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1">
                  Streak rewards
                </span>
                <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1">
                  Customizable routines
                </span>
                <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1">
                  Cosmetics + training
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
                Daily loop
              </div>
              <div className="mt-3 space-y-3">
                {[
                  {
                    title: "Care moments",
                    desc: "Feed, hydrate, play, and rest to keep needs balanced.",
                  },
                  {
                    title: "Training",
                    desc: "Practice commands to build skills and confidence.",
                  },
                  {
                    title: "Rewards",
                    desc: "Unlock new cosmetics as your streak grows.",
                  },
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-xs font-bold text-emerald-100">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">
                          {item.title}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[11px] text-zinc-400">
                Tip: consistency matters more than perfect timing.
              </div>
            </div>
          </div>
        </section>

        <section
          id="how"
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            {
              title: "Adopt & name",
              desc: "Pick your pup and set the starting vibe.",
            },
            {
              title: "Train the basics",
              desc: "Tap commands to build confidence and obedience.",
            },
            {
              title: "Style the yard",
              desc: "Use streak rewards to unlock fresh looks.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-black/25 p-5"
            >
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                {item.title}
              </div>
              <div className="mt-2 text-sm text-zinc-200">{item.desc}</div>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
