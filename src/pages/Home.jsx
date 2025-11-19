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
xxxxxxxxxxxxxxxxxx                >
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
