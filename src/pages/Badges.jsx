// src/pages/Badges.jsx

import * as React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageShell from "@/components/PageShell.jsx";
import EmptySlate from "@/components/EmptySlate.jsx";
import { selectDog } from "@/redux/dogSlice.js";
import {
  selectSettings,
  setBadgesGroupFilter,
  setBadgesCompactChips,
  setBadgesShowIds,
} from "@/redux/settingsSlice.js";
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
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const [query, setQuery] = React.useState("");

  const groupFilter = settings?.badgesGroupFilter || "all";
  const compactChips = settings?.badgesCompactChips === true;
  const showIds = settings?.badgesShowIds === true;

  const normalized = React.useMemo(() => {
    const ids = collectEarnedBadgeIds(dog);
    return normalizeBadges(ids);
  }, [dog]);

  const normalizedWithGroup = React.useMemo(
    () =>
      normalized.map((b) => ({
        ...b,
        group: groupForBadgeId(b.id),
      })),
    [normalized]
  );

  const groupCounts = React.useMemo(() => {
    const map = new Map();
    normalizedWithGroup.forEach((b) => {
      const g = b.group || "Other";
      map.set(g, (map.get(g) || 0) + 1);
    });
    return map;
  }, [normalizedWithGroup]);

  const filteredBadges = React.useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    return normalizedWithGroup.filter((b) => {
      if (groupFilter !== "all" && b.group !== groupFilter) return false;
      if (!q) return true;
      const label = String(b.label || "").toLowerCase();
      const id = String(b.id || "").toLowerCase();
      return label.includes(q) || id.includes(q);
    });
  }, [groupFilter, normalizedWithGroup, query]);

  const groups = React.useMemo(() => {
    const out = new Map();
    for (const b of filteredBadges) {
      const g = b.group || "Other";
      if (!out.has(g)) out.set(g, []);
      out.get(g).push(b);
    }
    return Array.from(out.entries());
  }, [filteredBadges]);

  const groupList = React.useMemo(() => {
    return Array.from(groupCounts.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [groupCounts]);

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
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <label htmlFor="badge-search" className="sr-only">
                    Search badges
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="badge-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search badges (try: trick, collar, star…)"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-emerald-500/70"
                    />
                    {query.trim() ? (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="shrink-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-500/60 hover:text-emerald-200"
                        aria-label="Clear search"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-zinc-400">
                  Showing{" "}
                  <span className="font-semibold text-zinc-100">
                    {filteredBadges.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-zinc-100">
                    {normalized.length}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                <button
                  type="button"
                  onClick={() => dispatch(setBadgesGroupFilter("all"))}
                  className={`rounded-full border px-3 py-1 font-semibold transition ${
                    groupFilter === "all"
                      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                      : "border-white/10 bg-black/30 text-zinc-200 hover:bg-black/45"
                  }`}
                >
                  All ({normalized.length})
                </button>
                {groupList.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => dispatch(setBadgesGroupFilter(g))}
                    className={`rounded-full border px-3 py-1 font-semibold transition ${
                      groupFilter === g
                        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                        : "border-white/10 bg-black/30 text-zinc-200 hover:bg-black/45"
                    }`}
                  >
                    {g} ({groupCounts.get(g) || 0})
                  </button>
                ))}

                <span className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(setBadgesCompactChips(!compactChips))
                    }
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-zinc-200 hover:bg-black/45"
                  >
                    {compactChips ? "Roomy chips" : "Compact chips"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(setBadgesShowIds(!showIds))}
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-zinc-200 hover:bg-black/45"
                  >
                    {showIds ? "Hide IDs" : "Show IDs"}
                  </button>
                </span>
              </div>
            </div>

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
                      className={`inline-flex items-center rounded-full border font-extrabold ${compactChips ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"} ${b.className}`}
                      title={b.id}
                    >
                      {showIds ? (
                        <span className="flex flex-col leading-tight">
                          <span>{b.label}</span>
                          <span className="text-[10px] text-zinc-400">
                            {b.id}
                          </span>
                        </span>
                      ) : (
                        b.label
                      )}
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
