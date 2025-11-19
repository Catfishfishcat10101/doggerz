// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { PATHS } from "src/routes.js";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            to={PATHS.HOME}
            className="flex items-baseline gap-2"
            aria-label="Doggerz home"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Doggerz
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:inline">
              Virtual pup simulator
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to={PATHS.LOGIN}
              className="text-sm text-zinc-300 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              to={PATHS.SIGNUP}
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-black transition"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2 lg:items-start">
          {/* Left: copy + CTA */}
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Adopt. Train. Bond.
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Your virtual pup, always one tap away.
              </h1>
            </div>

            <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
              Adopt your pup and take care of them over real time. Keep them fed,
              entertained, rested, and clean. How you treat your dog determines how
              long they live — no click-spamming, no idle mining.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={PATHS.ADOPT}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-black transition shadow-lg"
              >
                Get started
              </Link>

              <Link
                to={PATHS.LOGIN}
                className="rounded-full border border-zinc-700 hover:border-zinc-600 px-6 py-2.5 text-sm font-semibold transition"
              >
                Log in
              </Link>
            </div>

            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                to={PATHS.LOGIN}
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Log in.
              </Link>
            </p>
          </div>

          {/* Right: how it works card */}
          <aside className="max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 text-sm text-zinc-200 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              How Doggerz works
            </p>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li>• Your dog slowly ages even while you're logged out.</li>
              <li>
                • Hunger, boredom, and dirtiness creep up over real hours, not
                button mashing.
              </li>
              <li>
                • As cleanliness drops, your pup can go from dirty → fleas → mange.
              </li>
              <li>• Taking good care of your pup extends their life.</li>
            </ul>

            <Link
              to={PATHS.LEGAL}
              className="mt-4 inline-flex text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Read the full guide →
            </Link>
          </aside>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {year} Doggerz. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link
              to={PATHS.ABOUT}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              About
            </Link>
            <Link
              to={PATHS.CONTACT}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Contact
            </Link>
            <Link
              to={PATHS.LEGAL}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
