// src/pages/Home.jsx
// Doggerz: Main home page. Usage: <Home /> is the root route.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.

import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * Home: Main landing page for Doggerz.
 * - Hero section with call-to-action
 * - Explainer sections for lifecycle and cleanliness
 * - ARIA roles and meta tags for accessibility
 */
export default function Home() {
  const user = useSelector(selectUser);
  const isLoggedIn = !!user?.id;

  return (
    <PageContainer
      title="From puppy to wise senior"
      subtitle="A time-based virtual pup. Your care choices influence their lifespan, mood, training & story."
      metaDescription="Doggerz virtual dog home: adopt, care, train, and watch your pup age through life stages in real time."
      padding="px-4 py-10"
    >
      <section className="space-y-4 text-center" aria-label="Hero introduction">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
          Virtual Pup • Time-based care
        </p>
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-zinc-50"
          id="home-hero-heading"
        >
          How you treat your dog shapes every stage.
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400">
          Doggerz keeps time ticking while you’re away. Check in, feed, clean,
          play—choices ripple through growth and temperament.
        </p>

        <div
          className="mt-4 flex flex-wrap justify-center gap-3"
          aria-label="Primary actions"
        >
          <Link to="/adopt" className="dz-btn dz-btn--pill text-sm">
            Adopt
          </Link>

          {!isLoggedIn && (
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

          {isLoggedIn && (
            <Link
              to="/game"
              className="dz-btn dz-btn--ghost dz-btn--pill text-sm"
            >
              Back to game
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("doggerz-help");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="mt-4 text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
        >
          Learn how Doggerz works
        </button>
      </section>

      <section
        id="doggerz-help"
        className="mt-8 grid gap-6 md:grid-cols-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900/90 to-slate-950/95 p-6 sm:p-8"
        aria-label="Gameplay explainer"
      >
        <div
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 flex flex-col gap-3"
          aria-label="Lifecycle overview"
        >
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-50">
              Life stages
            </h3>
            <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
              Lifecycle
            </span>
          </header>
          <ul className="mt-1 space-y-3 text-sm text-zinc-300">
            <li>
              <span className="font-semibold text-emerald-400">Puppy</span>{" "}
              <span className="text-xs text-zinc-400">
                Fast growth, high energy.
              </span>
            </li>
            <li>
              <span className="font-semibold text-emerald-400">Adult</span>{" "}
              <span className="text-xs text-zinc-400">
                Balanced needs, routine learning.
              </span>
            </li>
            <li>
              <span className="font-semibold text-emerald-400">Senior</span>{" "}
              <span className="text-xs text-zinc-400">
                Slower pace, legacy memories.
              </span>
            </li>
            <li>
              <span className="font-semibold text-rose-400">Legacy</span>{" "}
              <span className="text-xs text-zinc-400">
                Care quality extends lifespan.
              </span>
            </li>
          </ul>
        </div>

        <div
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 flex flex-col gap-3"
          aria-label="Dog polls and cleanliness"
        >
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-50">
              Dog polls & cleanliness
            </h3>
            <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-400">
              Care loops
            </span>
          </header>
          <p className="text-xs text-zinc-400">
            Timed polls prompt quick care decisions. Ignoring them nudges mood,
            stats and streaks—your pup remembers how you show up.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
              <p className="font-semibold text-zinc-100 mb-1">Fresh</p>
              <p className="text-zinc-400">Clean, comfy, best bonuses.</p>
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
              <p className="font-semibold text-zinc-100 mb-1">Dirty</p>
              <p className="text-zinc-400">Mood dips, slower progress.</p>
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
              <p className="font-semibold text-zinc-100 mb-1">Fleas</p>
              <p className="text-zinc-400">Energy drains, more scratching.</p>
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-3">
              <p className="font-semibold text-zinc-100 mb-1">Mange</p>
              <p className="text-zinc-400">Harsh penalties, urgent care.</p>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
