// src/pages/About.jsx

import { Link } from "react-router-dom";

import { PATHS } from "@/app/routes.js";
import HeroDog from "@/components/dog/renderers/HeroDog.jsx";
import PageShell from "@/components/layout/PageShell.jsx";
import { PageHeader } from "@/components/layout/PageSections.jsx";

const CORE_LOOP = [
  "Play together to keep energy and happiness up.",
  "Bathe regularly to avoid fleas, mange, and illness.",
  "Pups auto-sleep when tired. Let them recharge.",
  "Take potty trips to build training and reduce accidents.",
];

const AGING_LIFE = [
  "Time is accelerated. Days matter.",
  "Good care extends life and unlocks more training.",
  "Neglect lowers cleanliness, health, and temperament.",
];

const QUICK_QUESTIONS = [
  {
    q: "Is Doggerz always running?",
    a: "Yes. Key stats decay and life stages progress even while you are away.",
  },
  {
    q: "What happens if I ignore my pup?",
    a: "Needs drop, temperament worsens, and sickness becomes more likely.",
  },
  {
    q: "Can I adopt again later?",
    a: "Yes. You can start fresh, but your current pup is a single life path.",
  },
  {
    q: "Is potty training permanent?",
    a: "Once trained, accidents become rare, but poor care can regress habits.",
  },
];

const TOUR_STATS = [
  { label: "Energy", value: "Recharges with sleep" },
  { label: "Cleanliness", value: "Baths prevent fleas" },
  { label: "Temperament", value: "Shaped by choices" },
  { label: "Training", value: "Unlocked by care" },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div
        className="relative mx-auto max-w-6xl space-y-10"
        style={{
          fontFamily: '"Space Grotesk", "IBM Plex Sans", "Manrope", system-ui',
        }}
      >
        <PageHeader className="space-y-4" unstyled>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
            How Doggerz Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-200">
            Real-time virtual pup, built for bonding
          </h1>
          <p className="max-w-3xl text-base sm:text-lg text-zinc-300 leading-relaxed">
            Doggerz is a living companion sim. Stats decay, life stages advance,
            and training progresses while you are away. The better you care, the
            more your pup trusts you.
          </p>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6">
              <h2 className="text-lg font-bold text-emerald-100">
                One real virtual pup
              </h2>
              <p className="mt-2 text-zinc-300 leading-relaxed">
                You adopt a single pup with a persistent life. Its needs,
                temperament, and habits keep ticking whether you are online or
                offline.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                    Live stats
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">
                    Hunger, energy, cleanliness, and mood change over time.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                    Long memory
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">
                    Your routine shapes temperament and unlocks new behaviors.
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <h3 className="text-base font-bold text-zinc-100">Core loop</h3>
                <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-zinc-300">
                  {CORE_LOOP.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <h3 className="text-base font-bold text-zinc-100">
                  Aging and life
                </h3>
                <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-zinc-300">
                  {AGING_LIFE.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2">
              <h3 className="text-base font-bold text-zinc-100">
                Life stages and temperament
              </h3>
              <p className="text-sm text-zinc-300">
                Life stages are earned through care and time. Temperament is not
                random. It is the sum of your choices, routines, and
                consistency.
              </p>
              <p className="text-sm text-zinc-400">
                Keep routines steady and you will see calmer behavior, stronger
                training performance, and better resilience.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <h3 className="text-base font-bold text-zinc-100">
                Quick questions
              </h3>
              <div className="mt-3 space-y-3">
                {QUICK_QUESTIONS.map((item) => (
                  <div
                    key={item.q}
                    className="rounded-xl border border-white/10 bg-black/35 p-4"
                  >
                    <div className="text-sm font-semibold text-emerald-200">
                      {item.q}
                    </div>
                    <div className="mt-2 text-sm text-zinc-300">{item.a}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-emerald-500/10 via-black/40 to-black/60 p-6">
              <div className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">
                Tour your virtual pup
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-24 w-24 rounded-2xl border border-white/10 bg-black/40 p-2">
                  <div className="flex h-full w-full items-end justify-center rounded-xl">
                    <HeroDog
                      stage="PUPPY"
                      variant="card"
                      anim="idle"
                      animationPreset="idle-sniff"
                      className="select-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-100">
                    Your pup, one life path
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Care quality changes outcomes and unlocks new behaviors.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {TOUR_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2"
                  >
                    <span className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                      {stat.label}
                    </span>
                    <span className="text-xs text-zinc-300">{stat.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2">
              <h3 className="text-base font-bold text-zinc-100">
                Short care guide
              </h3>
              <p className="text-sm text-zinc-300">
                Check in daily. A few minutes keeps stats stable and training on
                track. Small routines beat long sessions.
              </p>
              <p className="text-sm text-zinc-400">
                The pup does not pause. If you skip days, expect recovery work.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2">
              <h3 className="text-base font-bold text-zinc-100">
                What keeps ticking
              </h3>
              <ul className="mt-2 list-disc list-inside space-y-2 text-sm text-zinc-300">
                <li>Needs decay and recover based on actions.</li>
                <li>Training progress gates advanced behaviors.</li>
                <li>Temperament evolves with consistency.</li>
                <li>Life stage transitions unlock new animations.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                Need the technical side?
              </div>
              <h3 className="mt-2 text-base font-bold text-zinc-100">
                Developer notes
              </h3>
              <p className="mt-2 text-sm text-zinc-300">
                Integration details, render experiments, and engine-facing notes
                live on the Developers page.
              </p>
              <Link
                to={PATHS.DEVELOPERS}
                className="mt-4 inline-flex items-center rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/15"
              >
                Open Developers
              </Link>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
