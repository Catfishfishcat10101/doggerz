import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSettings,
  setDreamJournalKind,
  setDreamJournalSort,
  setDreamJournalShowMotifs,
  setDreamJournalShowSummary,
  setDreamJournalShowTimestamp,
  setDreamJournalCompactCards,
} from "@/redux/settingsSlice.js";

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

function normalizeKind(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) return "dream";
  return raw;
}

function kindBadge(kind) {
  const k = String(kind || "").toUpperCase();
  if (k === "NIGHTMARE")
    return "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100";
  if (k === "LUCID")
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
  return "border-sky-400/25 bg-sky-500/10 text-sky-100";
}

export default function DreamJournal({ dreams }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [query, setQuery] = useState("");
  const kindFilter = settings?.dreamJournalKind || "all";
  const sortOrder = settings?.dreamJournalSort || "newest";
  const showMotifs = settings?.dreamJournalShowMotifs !== false;
  const showSummary = settings?.dreamJournalShowSummary !== false;
  const showTimestamp = settings?.dreamJournalShowTimestamp !== false;
  const compactCards = settings?.dreamJournalCompactCards === true;

  const stats = useMemo(() => {
    const raw = Array.isArray(dreams) ? dreams : [];
    let lucid = 0;
    let nightmare = 0;
    let other = 0;
    raw.forEach((d) => {
      const kind = normalizeKind(d?.kind);
      if (kind === "lucid") lucid += 1;
      else if (kind === "nightmare") nightmare += 1;
      else other += 1;
    });
    return {
      total: raw.length,
      lucid,
      nightmare,
      other,
    };
  }, [dreams]);

  const entries = useMemo(() => {
    const raw = Array.isArray(dreams) ? dreams : [];
    const q = query.trim().toLowerCase();
    const filtered = raw.filter((d) => {
      const kind = normalizeKind(d?.kind);
      if (kindFilter !== "all" && kind !== kindFilter) return false;
      if (!q) return true;
      const title = String(d?.title || "").toLowerCase();
      const summary = String(d?.summary || "").toLowerCase();
      return title.includes(q) || summary.includes(q) || kind.includes(q);
    });
    const sorted = [...filtered].sort((a, b) => {
      const at = Number(a?.timestamp || 0);
      const bt = Number(b?.timestamp || 0);
      return sortOrder === "oldest" ? at - bt : bt - at;
    });
    return sorted;
  }, [dreams, kindFilter, query, sortOrder]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dreams"
              className="w-full sm:w-80 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 pr-16 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            {query.trim() ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 px-2.5 py-0.5 text-[11px] text-zinc-200 hover:bg-black/55"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>
            Showing{" "}
            <span className="font-semibold text-zinc-100">
              {entries.length}
            </span>{" "}
            dream{entries.length === 1 ? "" : "s"}
          </span>
          {query || kindFilter !== "all" || sortOrder !== "newest" ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                dispatch(setDreamJournalKind("all"));
                dispatch(setDreamJournalSort("newest"));
              }}
              className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/45"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
        <button
          type="button"
          onClick={() => dispatch(setDreamJournalKind("all"))}
          className={`rounded-full border px-3 py-1 font-semibold transition ${
            kindFilter === "all"
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
              : "border-white/10 bg-black/30 text-zinc-200 hover:bg-black/45"
          }`}
        >
          All ({stats.total})
        </button>
        <button
          type="button"
          onClick={() => dispatch(setDreamJournalKind("lucid"))}
          className={`rounded-full border px-3 py-1 font-semibold transition ${
            kindFilter === "lucid"
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
              : "border-white/10 bg-black/30 text-zinc-200 hover:bg-black/45"
          }`}
        >
          Lucid ({stats.lucid})
        </button>
        <button
          type="button"
          onClick={() => dispatch(setDreamJournalKind("nightmare"))}
          className={`rounded-full border px-3 py-1 font-semibold transition ${
            kindFilter === "nightmare"
              ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100"
              : "border-white/10 bg-black/30 text-zinc-200 hover:bg-black/45"
          }`}
        >
          Nightmare ({stats.nightmare})
        </button>
        <button
          type="button"
          onClick={() => dispatch(setDreamJournalKind("dream"))}
          className={`rounded-full border px-3 py-1 font-semibold transition ${
            kindFilter === "dream"
              ? "border-sky-400/40 bg-sky-500/10 text-sky-100"
              : "border-white/10 bg-black/30 text-zinc-200 hover:bg-black/45"
          }`}
        >
          Dream ({stats.other})
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              dispatch(
                setDreamJournalSort(
                  sortOrder === "newest" ? "oldest" : "newest"
                )
              )
            }
            className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/45"
          >
            {sortOrder === "newest" ? "Newest first" : "Oldest first"}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setDreamJournalShowMotifs(!showMotifs))}
            className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/45"
          >
            {showMotifs ? "Hide motifs" : "Show motifs"}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setDreamJournalShowSummary(!showSummary))}
            className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/45"
          >
            {showSummary ? "Hide summary" : "Show summary"}
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(setDreamJournalShowTimestamp(!showTimestamp))
            }
            className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/45"
          >
            {showTimestamp ? "Hide time" : "Show time"}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setDreamJournalCompactCards(!compactCards))}
            className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-zinc-200 hover:bg-black/45"
          >
            {compactCards ? "Roomy cards" : "Compact cards"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5 text-sm text-zinc-300">
            {stats.total === 0
              ? "No dreams logged yet. Let your pup rest to start collecting dreams."
              : "No dreams match that search yet. Try clearing filters."}
          </div>
        ) : (
          entries.map((d) => (
            <article
              key={d.id}
              className={`rounded-3xl border border-white/10 bg-black/30 shadow-[0_18px_60px_rgba(0,0,0,0.35)] ${
                compactCards ? "px-4 py-3" : "px-5 py-4"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${kindBadge(d.kind)}`}
                  >
                    {String(d.kind || "DREAM")}
                  </span>
                  <span className="uppercase tracking-[0.2em] text-zinc-500">
                    Dream
                  </span>
                </div>
                {showTimestamp ? (
                  <span>{formatEntryDate(d.timestamp)}</span>
                ) : null}
              </div>

              <h2 className="mt-2 text-sm font-semibold text-emerald-100">
                {String(d.title || "A dream")}
              </h2>
              {showSummary && d.summary ? (
                <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">
                  {String(d.summary)}
                </p>
              ) : null}

              {showMotifs && Array.isArray(d.motifs) && d.motifs.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.motifs.slice(0, 10).map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-200"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
