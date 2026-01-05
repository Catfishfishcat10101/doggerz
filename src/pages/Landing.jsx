/** @format */
// src/pages/Landing.jsx

import * as React from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell.jsx";
import { PATHS } from "@/routes.js";

export default function Landing() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-8 shadow-[0_0_90px_rgba(16,185,129,0.12)]">
          <div className="text-[11px] uppercase tracking-[0.32em] text-zinc-400">
            Doggerz
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-200">
            Virtual Pup Simulator
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-zinc-200/90">
            Raise a pup through choices, routines, and training—progress is
            earned through play, not idle clicking.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={PATHS.ADOPT}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
            >
              Adopt
            </Link>

            <Link
              to={PATHS.GAME}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Enter Yard
            </Link>

            <Link
              to={PATHS.SKILL_TREE}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Skill Tree
            </Link>

            <Link
              to={PATHS.SETTINGS}
              className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
