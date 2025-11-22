// src/pages/Splash.jsx
// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";
import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";

export default function Splash() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-50">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 lg:flex-row lg:items-center lg:py-24">
        {/* LEFT: wordmark + copy */}
        <div className="flex-1">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight">
            <span className="block text-emerald-400 drop-shadow-[0_0_24px_rgba(16,185,129,0.85)]">
              DOGGERZ
            </span>
            <span className="mt-4 block text-2xl sm:text-3xl font-semibold text-slate-100">
              virtual pup, real attitude
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-300">
            Adopt a single digital dog that lives on your device 24/7. Hunger,
            energy and cleanliness tick down in real time &mdash; whether
            you&apos;re on the screen or out living life.
          </p>

          {/* new subtitle – no receipts line */}
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Keep it fed, clean and trained to build a streak over time. Ignore
            your pup for too long and the mood, the mess, and the guilt all
            start to pile up.
          </p>

          {/* CTA row: Adopt + Login */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
            >
              Adopt a pup
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold border border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* RIGHT: live preview with EnhancedDogSprite */}
        <aside className="flex-1">
          <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/60 p-6 shadow-2xl shadow-emerald-500/15 backdrop-blur">
            <header className="flex items-center justify-between text-xs font-medium tracking-[0.2em] uppercase text-slate-400">
              <span>Preview</span>
              <span className="text-emerald-400/80">real-time sim</span>
            </header>

            <div className="mt-6 grid gap-6 items-center sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              {/* Sprite side */}
              <div className="flex items-center justify-center min-h-[10rem]">
                <EnhancedDogSprite
                  animation="idle"
                  scale={1.5}
                  showCleanlinessOverlay={false}
                  reducedMotion={false}
                />
              </div>

              {/* Stats side */}
              <dl className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between gap-6 border-b border-slate-800 pb-3">
                  <dt className="text-slate-400">Mood</dt>
                  <dd className="font-medium text-emerald-300">TBD</dd>
                </div>

                <div className="flex justify-between gap-6">
                  <dt className="text-slate-400">Hunger</dt>
                  <dd className="text-right text-emerald-300">
                    ticks hourly
                    <br />
                    snacks help… kinda
                  </dd>
                </div>

                <div className="flex justify-between gap-6">
                  <dt className="text-slate-400">Energy</dt>
                  <dd className="text-right text-emerald-300">
                    sleeps to heal
                    <br />
                    zoomies cost extra
                  </dd>
                </div>

                <div className="flex justify-between gap-6">
                  <dt className="text-slate-400">Cleanliness</dt>
                  <dd className="text-right text-emerald-300">
                    dirt accumulates
                    <br />
                    baths are “opinions”
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
// End of src/pages/Splash.jsx