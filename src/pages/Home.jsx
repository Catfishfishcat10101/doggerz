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
          {/* Logo acts as Home */}
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

          <div className="flex items-center gap-6">
            {/* Main nav – no Home, no Legal */}
            <nav className="hidden items-center gap-4 md:flex">
              <Link
                to={PATHS.ABOUT}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                to={PATHS.CONTACT}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Auth actions */}
            <div className="flex items-center gap-2">
              <Link
                to={PATHS.LOGIN}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                to={PATHS.SIGNUP}
                className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-50 shadow-sm hover:bg-emerald-500 active:scale-[0.97] transition"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN HERO */}
      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          {/* Left: headline */}
          <div className="max-w-xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Adopt. Care. Level up.
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-zinc-50 sm:text-4xl md:text-5xl">
              Your{" "}
              <span className="text-emerald-400">virtual pup,</span>
              <br />
              always one tap away.
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              Adopt your pup and take care of them over real time. Keep them fed,
              entertained, rested, and clean. How you treat your dog determines
              how long they thrive — no click-spamming, no idle mining.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                to={PATHS.ADOPT}
                className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 font-semibold text-emerald-50 shadow-sm hover:bg-emerald-500 active:scale-[0.97] transition"
              >
                Get started
              </Link>
              <p className="text-xs text-zinc-400 sm:text-sm">
                Already have an account?{" "}
                <Link
                  to={PATHS.LOGIN}
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Log in.
                </Link>
              </p>
            </div>
          </div>

          {/* Right: how it works card */}
          <aside className="max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 text-sm text-zinc-200 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              How Doggerz works
            </p>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li>• Your dog slowly ages even while you&apos;re logged out.</li>
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
              to={PATHS.LEGAL} // This is just a lightweight link; main Legal entry is in footer
              className="mt-4 inline-flex text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Read the full guide →
            </Link>
          </aside>
        </section>
      </main>

      {/* FOOTER – Legal lives here */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {year} Doggerz. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link
              to={PATHS.LEGAL}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Legal
            </Link>
            <span className="hidden h-3 w-px bg-zinc-800 sm:inline-block" />
            <p className="text-zinc-500">
              Built to keep your virtual pup thriving, not idle-farmed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
