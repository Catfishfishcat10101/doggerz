// src/pages/Contribute.jsx
// Doggerz: Contribute / support page.
// Explains how players can help shape and support the project.

import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "@/features/game/components/PageContainer.jsx";

const CONTRIBUTION_BLOCKS = [
  {
    label: "Play & share",
    badge: "Instant impact",
    bullets: [
      "Play regularly and see how the systems feel over days and weeks.",
      "Share Doggerz with friends who love dogs or sim games.",
      "Tell us what parts feel fun, confusing, or too grindy.",
    ],
  },
  {
    label: "Give feedback",
    badge: "Help tune the sim",
    bullets: [
      "Report bugs, crashes, or weird stat behavior.",
      "Suggest training ideas, potty streak rewards, or life-stage events.",
      "Tell us where the UI feels cluttered or empty.",
    ],
  },
  {
    label: "Support development",
    badge: "Coming soon",
    bullets: [
      "Optional supporter packs and cosmetics will arrive later.",
      "You’ll never need to pay to keep your pup alive or happy.",
      "For now, the best support is feedback and sharing the app.",
    ],
  },
];

const FUTURE_PERKS = [
  "Early access to new breeds, tricks, and events.",
  "Exclusive cosmetic items and badges that don’t affect balance.",
  "Name in the credits or a small in-game thank-you.",
];

export default function ContributePage() {
  return (
    <PageContainer
      title="Contribute to Doggerz"
      subtitle="Help shape the virtual pup simulator — feedback, testing, sharing, and future supporter perks."
      metaDescription="Learn how to contribute to Doggerz by playing, sharing feedback, helping test new features, and supporting development."
      padding="px-6 py-10"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        {/* LEFT: main contribution blocks */}
        <div className="space-y-8 text-base leading-relaxed text-zinc-200">
          {/* Intro card */}
          <section className="space-y-3 rounded-2xl border border-emerald-500/20 bg-zinc-900/70 px-4 py-4 shadow-md shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              WHY CONTRIBUTION MATTERS
            </p>
            <p>
              Doggerz is tuned around real-time care, life stages, and long-term
              potty training streaks. The best way to improve it is by watching
              how real players use it, where they get attached, and where things
              feel off. Every bit of feedback helps tighten the loop.
            </p>
            <p className="text-sm text-zinc-400">
              You do not need to spend money to contribute. Playing, sharing,
              and telling us what feels good (or bad) is already a huge help.
            </p>
          </section>

          {/* Contribution categories */}
          <section
            aria-label="Ways to contribute"
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4"
          >
            <h2 className="text-lg font-semibold text-zinc-50">
              Ways you can help today
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {CONTRIBUTION_BLOCKS.map((block) => (
                <article
                  key={block.label}
                  className="flex flex-col gap-2 rounded-2xl bg-zinc-900/80 px-3 py-3"
                >
                  <header className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {block.label}
                    </h3>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                      {block.badge}
                    </span>
                  </header>
                  <ul className="mt-1 space-y-1.5 text-[0.9rem] text-zinc-300">
                    {block.bullets.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* Future perks */}
          <section
            aria-label="Future supporter perks"
            className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4"
          >
            <h2 className="text-lg font-semibold text-emerald-300">
              Future supporter perks
            </h2>
            <p className="text-[0.95rem]">
              As Doggerz grows, optional supporter features may unlock. These
              are cosmetic or convenience-based, never required to care for your
              pup:
            </p>
            <ul className="mt-1 list-disc list-inside space-y-1.5 text-[0.9rem] text-zinc-200">
              {FUTURE_PERKS.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <p className="pt-1 text-xs text-zinc-400">
              Exact details may change; this page will stay honest about what
              paid features do and don&apos;t affect.
            </p>
          </section>

          {/* Contact / feedback CTA */}
          <section
            aria-label="Contact and feedback"
            className="space-y-3 border-t border-zinc-800 pt-6"
          >
            <h2 className="text-lg font-semibold text-zinc-50">
              Got feedback or found a bug?
            </h2>
            <p className="text-[0.95rem] text-zinc-200">
              Keep a note of what happened (what you tapped, what screen you
              were on, what you expected vs. what you saw). Screenshots are
              gold. Use the Support link in the footer or the in-app feedback
              option once it is live.
            </p>
            <p className="text-xs text-zinc-400">
              If you prefer, you can also reach out via the Support area when it
              goes live — this page is designed to plug into that flow.
            </p>
          </section>
        </div>

        {/* RIGHT: simple supporter card */}
        <aside
          aria-label="Supporter overview"
          className="relative mt-2 lg:mt-0"
        >
          <div className="pointer-events-none absolute -inset-5 -z-10 bg-emerald-500/10 blur-3xl" />
          <div className="flex h-full flex-col justify-between rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-emerald-500/30">
            <header className="mb-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                COMMUNITY-DRIVEN
              </p>
              <h2 className="text-base font-semibold text-zinc-50">
                Doggerz grows with its trainers.
              </h2>
              <p className="text-xs text-zinc-300">
                Every session, streak, and bug report helps tune the systems so
                pups feel alive without feeling like chores.
              </p>
            </header>

            <div className="space-y-3 text-sm text-zinc-200">
              <p>
                If you like where Doggerz is heading, the best contribution
                right now is simple:{" "}
                <span className="font-semibold text-emerald-300">
                  keep playing and tell us what feels off.
                </span>{" "}
                The app will add clearer feedback and support entry points over
                time.
              </p>
              <p className="text-xs text-zinc-400">
                Long term, this card can link out to supporter tiers, dev logs,
                or community hubs — the layout is ready for those hooks.
              </p>
            </div>

            <footer className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-300">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Back to home
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-4 py-2 text-[11px] font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
              >
                Learn how the sim works
              </Link>
            </footer>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
