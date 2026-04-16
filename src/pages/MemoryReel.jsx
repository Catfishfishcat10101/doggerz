// src/pages/MemoryReel.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PATHS } from "@/app/routes.js";
import { useDogMemoryState } from "@/hooks/useDogState.js";
import PageShell from "@/components/layout/PageShell.jsx";
import EmptySlate from "@/components/ui/EmptySlate.jsx";
import {
  buildMemoryJournalModel,
  getMemoryStoryFilterOptions,
} from "@/features/dog/memory/memoryJournalModel.js";

const TYPE_OPTIONS = [
  "All",
  "CARE",
  "TRAINING",
  "LEVEL_UP",
  "NEGLECT",
  "UNLOCK",
  "MEMORY",
];

function formatEntryDate(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MemoryReel() {
  const { name, journal, memories, memoryDrives } = useDogMemoryState();

  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [storyFilter, setStoryFilter] = useState("all");
  const [compact, setCompact] = useState(false);
  const [showBody, setShowBody] = useState(true);
  const [sortNewest, setSortNewest] = useState(true);
  const [showMoodTags, setShowMoodTags] = useState(true);
  const storyFilterOptions = useMemo(() => getMemoryStoryFilterOptions(), []);
  const journalModel = useMemo(
    () =>
      buildMemoryJournalModel({
        memories,
        journalEntries: journal?.entries,
        query,
        categoryFilter: storyFilter,
        sortNewest,
      }),
    [journal?.entries, memories, query, sortNewest, storyFilter]
  );

  const entries = useMemo(() => {
    const filtered = journalModel.entries.filter((e) => {
      const entryType = String(e?.category || e?.type || "").toUpperCase();
      if (type !== "All" && entryType !== type) {
        return false;
      }
      return true;
    });
    return filtered;
  }, [journalModel.entries, type]);

  return (
    <PageShell mainClassName="px-4 py-10" containerClassName="w-full max-w-5xl">
      <div className="w-full">
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Memory Reel
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-200">
              {name || "Your pup"}&rsquo;s story
            </h1>
            <p className="mt-2 text-sm text-zinc-200/90 max-w-prose">
              A timeline of care, training, and small moments that add up to a
              lasting bond.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-zinc-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Story moments {journalModel.totalEntries}
              </span>
              <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1">
                Hungry drive {Math.round(Number(memoryDrives?.hungry || 0))}
              </span>
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1">
                Lonely drive {Math.round(Number(memoryDrives?.lonely || 0))}
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1">
                Playful drive {Math.round(Number(memoryDrives?.playful || 0))}
              </span>
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1">
                Restless drive {Math.round(Number(memoryDrives?.restless || 0))}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {journalModel.highlights.length > 0 ? (
              <div className="mb-6 grid gap-3 lg:grid-cols-3">
                {journalModel.highlights.slice(0, 3).map((highlight) => (
                  <article
                    key={highlight.id}
                    className="rounded-3xl border border-white/10 bg-black/25 p-4"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                      <span>
                        {highlight.category?.icon} {highlight.category?.label}
                      </span>
                      <span>{formatEntryDate(highlight.timestamp)}</span>
                    </div>
                    <h2 className="mt-2 text-sm font-semibold text-emerald-100">
                      {highlight.summary}
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-zinc-400">
                      A standout moment from the{" "}
                      {String(
                        highlight.category?.label || "story"
                      ).toLowerCase()}{" "}
                      chapter.
                    </p>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="mb-6 flex flex-wrap gap-2">
              {storyFilterOptions.map((option) => {
                const count =
                  option.id === "all"
                    ? journalModel.countsByCategory?.all || 0
                    : journalModel.countsByCategory?.[option.id] || 0;
                const active = storyFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStoryFilter(option.id)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                      active
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                        : "border-white/10 bg-black/30 text-zinc-300 hover:bg-black/45"
                    }`}
                  >
                    {option.label} · {count}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search memories"
                  className="w-full sm:w-72 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full sm:w-44 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                      className="bg-zinc-950 text-zinc-100"
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                <button
                  type="button"
                  onClick={() => setCompact((v) => !v)}
                  className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70 hover:bg-black/55"
                >
                  {compact ? "Expanded" : "Compact"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBody((v) => !v)}
                  className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70 hover:bg-black/55"
                >
                  {showBody ? "Hide details" : "Show details"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMoodTags((v) => !v)}
                  className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70 hover:bg-black/55"
                >
                  {showMoodTags ? "Mood tags on" : "Mood tags off"}
                </button>
                <button
                  type="button"
                  onClick={() => setSortNewest((v) => !v)}
                  className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70 hover:bg-black/55"
                >
                  {sortNewest ? "Newest first" : "Oldest first"}
                </button>

                <span className="ml-1">
                  Showing{" "}
                  <span className="font-semibold text-zinc-100">
                    {entries.length}
                  </span>{" "}
                  memory{entries.length === 1 ? "" : "ies"}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {entries.length === 0 ? (
                <EmptySlate
                  kicker="Memory Reel"
                  title="Nothing matches yet"
                  description="Try clearing filters, then spend time with your pup to create new memories."
                  primaryLabel="Clear filters"
                  onPrimary={() => {
                    setQuery("");
                    setType("All");
                    setStoryFilter("all");
                  }}
                />
              ) : (
                entries.map((entry) => (
                  <article
                    key={entry.id}
                    className={`rounded-3xl border border-white/10 bg-black/30 px-5 ${
                      compact ? "py-3" : "py-4"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-[0.2em] text-zinc-500">
                          {entry.category || entry.type || "MEMORY"}
                        </span>
                        {entry.moodTag && showMoodTags ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                            {entry.moodTag}
                          </span>
                        ) : null}
                        {entry.storyCategory ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-100">
                            {entry.storyCategory.icon}{" "}
                            {entry.storyCategory.label}
                          </span>
                        ) : null}
                        {entry.emotion ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                            {entry.emotion}
                          </span>
                        ) : null}
                        {entry.sourceMemory ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                            from {String(entry.sourceMemory).replace(/_/g, " ")}
                          </span>
                        ) : null}
                      </div>
                      <span>{formatEntryDate(entry.timestamp)}</span>
                    </div>
                    <h2 className="mt-2 text-sm font-semibold text-emerald-100">
                      {entry.summary || "A small moment"}
                    </h2>
                    {entry.body && showBody ? (
                      <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">
                        {entry.body}
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>

            {entries.length > 0 ? (
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to={PATHS.GAME}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition"
                >
                  Back to the yard
                </Link>
                <Link
                  to={PATHS.RAINBOW_BRIDGE}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
                >
                  Visit Rainbow Bridge
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
