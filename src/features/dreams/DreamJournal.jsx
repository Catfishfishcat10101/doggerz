import { useMemo, useState } from "react";

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

function kindBadge(kind) {
  const k = String(kind || "").toUpperCase();
  if (k === "NIGHTMARE") return "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100";
  if (k === "LUCID") return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
  return "border-sky-400/25 bg-sky-500/10 text-sky-100";
}

export default function DreamJournal({ dreams }) {
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const raw = Array.isArray(dreams) ? dreams : [];
    const q = query.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter((d) => {
      const title = String(d?.title || "").toLowerCase();
      const summary = String(d?.summary || "").toLowerCase();
      const kind = String(d?.kind || "").toLowerCase();
      return title.includes(q) || summary.includes(q) || kind.includes(q);
    });
  }, [dreams, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dreams"
          className="w-full sm:w-72 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
        />
        <div className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-100">{entries.length}</span> dream{entries.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-5 text-sm text-zinc-300">
            No dreams match that search yet. Let your pup rest to start collecting dreams.
          </div>
        ) : (
          entries.map((d) => (
            <article
              key={d.id}
              className="rounded-3xl border border-white/10 bg-black/30 px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${kindBadge(d.kind)}`}>
                    {String(d.kind || "DREAM")}
                  </span>
                  <span className="uppercase tracking-[0.2em] text-zinc-500">Dream</span>
                </div>
                <span>{formatEntryDate(d.timestamp)}</span>
              </div>

              <h2 className="mt-2 text-sm font-semibold text-emerald-100">
                {String(d.title || "A dream")}
              </h2>
              {d.summary ? (
                <p className="mt-2 whitespace-pre-line text-sm text-zinc-300">
                  {String(d.summary)}
                </p>
              ) : null}

              {Array.isArray(d.motifs) && d.motifs.length ? (
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
