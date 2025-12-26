// src/pages/Landing.jsx
// Doggerz – Virtual Pup Adoption Homepage

import * as React from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer.jsx";

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-black"
      >
        Skip to content
      </a>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* HEADER */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-5">
            <img
              src="/icons/doggerz-logo.svg"
              alt="Doggerz"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2"
            />
            <div>
              <h1
                className="font-extrabold leading-none text-emerald-600 dark:text-emerald-400 drop-shadow-[0_18px_40px_rgba(16,185,129,0.35)] text-5xl sm:text-6xl md:text-7xl"
                aria-label="DOGGERZ"
              >
                <span className="sr-only">D O G G E R Z</span>
                <span aria-hidden className="tracking-[0.001em]">
                  D O G G E R Z
                </span>
              </h1>
              <br></br>
              <p className="text-xs uppercase tracking-[0.5em] text-zinc-500 dark:text-zinc-400">
                Adopt. Train. Bond.
              </p>
            </div>
          </div>

          <nav className="hidden flex-wrap items-center gap-4 text-sm md:flex">
            <Link
              to="/game"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              Game
            </Link>
            <Link
              to="/about"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              About
            </Link>
            <Link
              to="/faq"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              FAQs
            </Link>
            <Link
              to="/contact"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              Contact Us
            </Link>
            <Link
              to="/help"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              Help
            </Link>
            <Link
              to="/developers"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              Developers
            </Link>
            <Link
              to="/privacy"
              className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
            >
              Policy
            </Link>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section
          id="landing-main"
          className="grid items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"

        >
          {/* Left: copy */}
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Adopt your own{" "}
              <span className="text-emerald-500">Puppy!</span>
              <br />
              </h2>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              and create your story.
              </h1>

            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              Feed, Play, Teach & Love your furry troublemaker. Watch
              them grow from A Clumbsy Little Puppy to A Loyal & Trustworthy Best Friend       - if you can
              manage their energy, moods, and mischief..
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/adopt"
                className="inline-flex items-center justify-center rounded-full border bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow shadow-emerald-500/40 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Adopt your pup
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-emerald-800 bg-transparent px-5 py-2.5 text-sm font-medium text-emerald-700 transition-transform hover:-translate-y-0.5 hover:border-emerald-600/80 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Already have a Furbaby?
              </Link>
            </div>

            {/* Feature bullets */}
            <dl className="grid gap-4 pt-4 text-xs sm:grid-cols-3 sm:text-sm">
              <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                <dt className="mb-1 font-semibold text-emerald-700 dark:text-emerald-300">
                  ~ Adopt & Name ~
                </dt>
                <br></br>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  Meet your pup.<br></br> Give them a name.<br></br> And start your journey!
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                <dt className="mb-1 font-semibold text-emerald-700 dark:text-emerald-300">
                  ~ Train your way ~
                </dt>
                <br></br>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  Teach good habits, or embrace the chaos!<br></br> It's all up to you.
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                <dt className="mb-1 font-semibold text-emerald-700 dark:text-emerald-300">
                ~ Bond & Grow ~
                </dt>
                <br></br>
                <dd className="text-zinc-600 dark:text-zinc-400">
                  Your choices shape the story you tell together.
                </dd>
              </div>
            </dl>
          </div>

          {/* Right: Dog card */}
          <div className="relative">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)] opacity-90 blur-3xl" />

            <div className="rounded-3xl border border-emerald-500/40 bg-white/70 px-6 py-6 shadow-[0_0_40px_rgba(16,185,129,0.25)] dark:bg-zinc-950/90 dark:shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                    Kennel
                  </p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No pup yet</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500">
                    Adopt or sign in to see your dog here.
                  </p>
                </div>
                <span className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-zinc-700 dark:border-zinc-700 dark:bg-black/40 dark:text-zinc-300">
                  Ready
                </span>
              </div>

              {/* Pre-adoption preview (no specific pup shown) */}
              <div className="relative mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-100 to-zinc-200 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
                <img
                  src="/icons/doggerz-logo.svg"
                  alt="Doggerz"
                  width={220}
                  height={220}
                  decoding="async"
                  className="relative h-24 w-24 opacity-90 drop-shadow-[0_12px_25px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* CTAs are already on the left side; avoid duplicate buttons here. */}
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
