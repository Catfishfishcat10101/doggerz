import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { PATHS } from "@/routes.js";
import { selectDog, selectDogDreams } from "@/redux/dogSlice.js";

import PageShell from "@/components/PageShell.jsx";

import DreamJournal from "@/features/dreams/DreamJournal.jsx";

export default function Dreams() {
  const dog = useSelector(selectDog);
  const dreamsState = useSelector(selectDogDreams);

  const dreams = useMemo(() => {
    const raw = Array.isArray(dreamsState?.journal) ? dreamsState.journal : [];
    return raw;
  }, [dreamsState?.journal]);

  const stats = useMemo(() => {
    let lucid = 0;
    let nightmare = 0;
    let other = 0;
    let latest = 0;
    dreams.forEach((d) => {
      const kind = String(d?.kind || "dream").toLowerCase();
      if (kind === "lucid") lucid += 1;
      else if (kind === "nightmare") nightmare += 1;
      else other += 1;
      const ts = Number(d?.timestamp || 0);
      if (ts > latest) latest = ts;
    });
    return {
      total: dreams.length,
      lucid,
      nightmare,
      other,
      latest,
    };
  }, [dreams]);

  const latestLabel = stats.latest
    ? new Date(stats.latest).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <PageShell mainClassName="px-4 py-10" containerClassName="w-full max-w-5xl">
      <div className="w-full">
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Dream Journal
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-200">
              {dog?.name || "Your pup"}&rsquo;s dreams
            </h1>
            <p className="mt-2 text-sm text-zinc-200/90 max-w-prose">
              A good day can bring lucid dreams; Neglect can trigger nightmares.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">
                Total {stats.total}
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">
                Lucid {stats.lucid}
              </span>
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1">
                Nightmare {stats.nightmare}
              </span>
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1">
                Dream {stats.other}
              </span>
              {latestLabel ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-zinc-200">
                  Latest {latestLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {stats.total === 0 ? (
              <div className="mb-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-zinc-300">
                No dreams logged yet. Let your pup rest after a full day to
                start collecting dreams.
              </div>
            ) : null}
            <DreamJournal dreams={dreams} />

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={PATHS.GAME}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition"
              >
                Back to the yard
              </Link>
              <Link
                to={PATHS.MEMORIES}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
              >
                Open Memory Reel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
