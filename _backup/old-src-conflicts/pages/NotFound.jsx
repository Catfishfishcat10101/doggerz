// _backup/old-src-conflicts/pages/NotFound.jsx
// src/pages/NotFound.jsx

import { useNavigate } from "react-router-dom";
import { PATHS } from "@/app/routes.js";
import PageShell from "@/components/layout/PageShell.jsx";

export default function NotFound() {
  const nav = useNavigate();

  return (
    <PageShell useSurface={false}>
      <div className="mx-auto grid min-h-[70vh] w-full max-w-xl place-items-center px-4 py-10">
        <div className="w-full rounded-[30px] border border-white/10 bg-black/40 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/80">
            Route not found
          </div>
          <h1 className="mt-3 text-6xl font-extrabold text-emerald-100">404</h1>
          <p className="mt-3 text-sm text-zinc-300 sm:text-base">
            This route doesn&apos;t exist, or your pup took a wrong turn in the
            yard.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => nav(PATHS.HOME)}
              className="rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-black transition hover:bg-emerald-300"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => nav(PATHS.ADOPT)}
              className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 font-semibold text-zinc-100 transition hover:bg-black/35"
            >
              Adopt
            </button>

            <button
              type="button"
              onClick={() => nav(-1)}
              className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 font-semibold text-zinc-100 transition hover:bg-black/35"
            >
              Back
            </button>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            If this came from an old bookmark, the route may have moved during
            final polish.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
