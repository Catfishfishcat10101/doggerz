// src/pages/MemoryReel.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectDog, selectDogJournal } from "@/redux/dogSlice.js";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

const TYPE_OPTIONS = ["All", "CARE", "TRAINING", "LEVEL_UP", "NEGLECT", "UNLOCK", "MEMORY"];

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
  const dog = useSelector(selectDog);
  const journal = useSelector(selectDogJournal);

  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");

  const entries = useMemo(() => {
    const raw = Array.isArray(journal?.entries) ? journal.entries : [];
    const q = query.trim().toLowerCase();
    return raw.filter((e) => {
      if (type !== "All" && String(e?.type || "").toUpperCase() !== type) {
        return false;
      }
      if (!q) return true;
      const summary = String(e?.summary || "").toLowerCase();
      const body = String(e?.body || "").toLowerCase();
      return summary.includes(q) || body.includes(q);
    });
  }, [journal?.entries, query, type]);

  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-100">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Memory Reel
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-200">
              {dog?.name || "Your pup"}&rsquo;s story
            </h1>
            <p className="mt-2 text-sm text-zinc-200/90 max-w-prose">
              Every day together leaves a trace. This is the long-form timeline of care,
              training, and small moments that add up to a bond.
            </p>
          </div>

          <div className="p-6 sm:p-8">
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
                    <option key={opt} value={opt} className="bg-zinc-950 text-zinc-100">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-zinc-400">
                Showing <span className="font-semibold text-zinc-100">{entries.length}</span>{" "}
                memory{entries.length === 1 ? "" : "ies"}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {entries.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5 text-sm text-zinc-300">
                  No memories match that filter yet. Spend time with your pup to create new entries.
                </div>
              ) : (
                entries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-3xl border border-white/10 bg-black/30 px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="uppercase tracking-[0.2em] text-zinc-500">
                          {entry.type || "MEMORY"}
                        </span>
                        {entry.moodTag ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                            {entry.moodTag}
                          </span>
                        ) : null}
                      </div>
                      <span>{formatEntryDate(entry.timestamp)}</span>
                    </div>
                    <h2 className="mt-2 text-sm font-semibold text-emerald-100">
                      {entry.summary || "A small moment"}
                    </h2>
                    {entry.body ? (
                      <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">
                        {entry.body}
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/game"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition"
              >
                Back to the yard
              </Link>
              <Link
                to="/rainbow-bridge"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
              >
                Visit Rainbow Bridge
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
