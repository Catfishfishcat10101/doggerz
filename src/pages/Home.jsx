// src/pages/Home.jsx
// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";

export default function Home() {
  const user = useSelector(selectUser);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-10">
        {/* Hero / intro */}
        <section className="space-y-4 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Virtual Pup • Time-based care
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">
            From puppy to wise senior. How you treat your dog literally
            determines its lifespan.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400">
            Doggerz keeps time ticking while you&apos;re away. Check in, feed,
            clean, and play—your choices shape their story.
          </p>

          {/* CTAs */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/adopt" className="dz-btn dz-btn--pill text-sm">
              Adopt
            </Link>

            {!user && (
              <>
                <Link
                  to="/login"
                  className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
                >
                  Sign up
                </Link>
              </>
            )}

            {user && (
              <Link
                to="/game"
                className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
              >
                Back to game
              </Link>
            )}
          </div>

          {/* Need help? -> scroll to explainer */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("doggerz-help");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="mt-4 text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
          >
            Need help? Learn how Doggerz works.
          </button>
        </section>

        {/* Explainer / help section */}
        <section
          id="doggerz-help"
          className="grid gap-6 md:grid-cols-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900/90 to-slate-950/95 p-6 sm:p-8"
        >
          {/* Life doesn’t pause */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 flex flex-col gap-3">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-50">
                Life doesn&apos;t pause
              </h2>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
                Lifecycle
              </span>
            </header>

            <ul className="mt-1 space-y-3 text-sm text-zinc-300">
              <li>
                <span className="font-semibold text-emerald-400">1</span>{" "}
                <span className="font-semibold">Puppy • 0–6 months</span>
                <br />
                <span className="text-xs text-zinc-400">
                  High energy, fast growth, soaking up every cuddle.
                </span>
              </li>
              <li>
                <span className="font-semibold text-emerald-400">2</span>{" "}
                <span className="font-semibold">
                  Adult • 6 months – 7 years
                </span>
                <br />
                <span className="text-xs text-zinc-400">
                  Balanced needs, learns routines, pushes for adventures.
                </span>
              </li>
              <li>
                <span className="font-semibold text-emerald-400">3</span>{" "}
                <span className="font-semibold">Senior • 7+ years</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Slower pace, higher care requirements, legacy memories.
                </span>
              </li>
              <li>
                <span className="font-semibold text-rose-400">∞</span>{" "}
                <span className="font-semibold">Legacy</span>
                <br />
                <span className="text-xs text-zinc-400">
                  Care well and extend their days. Neglect them and the story
                  ends sooner.
                </span>
              </li>
            </ul>
          </div>

          {/* Dog polls / cleanliness */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 flex flex-col gap-3">
            <header className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-50">
                Dog polls &amp; cleanliness
              </h2>
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
                Care loops
              </span>
            </header>

            <p className="text-xs text-zinc-400">
              Timed &quot;dog polls&quot; nudge you with quick decisions. Ignore
              them and your pup reacts. Bathing and yard care affect mood,
              energy, and long-term health.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Fresh</p>
                <p className="text-zinc-400">
                  Regular baths, clean yard, happy dog.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Dirty</p>
                <p className="text-zinc-400">
                  Dirt and grime slowly drag happiness down.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Fleas</p>
                <p className="text-zinc-400">
                  Neglect long enough and fleas show up, draining energy.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
                <p className="font-semibold text-zinc-100 mb-1">Mange</p>
                <p className="text-zinc-400">
                  Worst-case state. Requires serious care to recover.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
