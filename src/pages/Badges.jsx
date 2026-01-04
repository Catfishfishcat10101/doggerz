// src/pages/Badges.jsx

import * as React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import PageShell from "@/components/PageShell.jsx";
import EmptySlate from "@/components/EmptySlate.jsx";
import { selectDog } from "@/utils/redux/dogSlice.js";
import { collectEarnedBadgeIds, normalizeBadges } from "@/utils/badges.js";

function groupForBadgeId(id) {
  const raw = String(id || "");
  if (raw.startsWith("trick_")) return "Tricks";
  if (
    raw.startsWith("collar_") ||
    raw.startsWith("tag_") ||
    raw.startsWith("backdrop_")
  ) {
    return "Cosmetics";
  }
  return "Other";
}

export default function BadgesPage() {
  const dog = useSelector(selectDog);

  const normalized = React.useMemo(() => {
    const ids = collectEarnedBadgeIds(dog);
    return normalizeBadges(ids);
  }, [dog]);

  const groups = React.useMemo(() => {
    const out = new Map();
    for (const b of normalized) {
      const g = groupForBadgeId(b.id);
      if (!out.has(g)) out.set(g, []);
      out.get(g).push(b);
    }
    return Array.from(out.entries());
  }, [normalized]);

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-200">Badges</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Everything your pup has earned so far — tricks mastered, cosmetics
            unlocked, and more.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/game"
            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
          >
            Back to yard
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/12 bg-black/20 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-zinc-200">
            Total earned
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-100">
            {normalized.length}
          </div>
        </div>

        {normalized.length === 0 ? (
          <div className="mt-4">
            <EmptySlate
              kicker="Badges"
              title="No badges yet"
              description="Your pup earns badges by living their best life: train tricks, keep routines, and unlock cosmetics."
              primaryLabel="Go to the yard"
              primaryTo="/game"
            />
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {groups.map(([groupName, items]) => (
              <section key={groupName}>
                <div className="text-xs font-extrabold tracking-wide text-zinc-300">
                  {groupName}
                  <span className="ml-2 text-[11px] font-semibold text-zinc-400">
                    ({items.length})
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((b) => (
                    <span
                      key={b.key}
                      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${b.className}`}
                      title={b.id}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
