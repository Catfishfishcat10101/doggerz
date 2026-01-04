function formatTime(ts) {
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

function formatDeltaLabel(key, delta) {
  const n = Number(delta || 0);
  const sign = n > 0 ? "+" : "";

  const names = {
    adventurous: "Adventurous",
    social: "Social",
    energetic: "Energetic",
    playful: "Playful",
    affectionate: "Affectionate",
  };

  return `${names[key] || key} ${sign}${Math.round(n)}`;
}

export default function PersonalityEvolutionTimeline({ history, maxItems = 10 }) {
  const rows = Array.isArray(history) ? history.slice(0, maxItems) : [];

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-400">
        Personality changes will appear here as you feed, play, rest, and train.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {rows.map((e) => {
          const deltas = e?.deltas && typeof e.deltas === "object" ? e.deltas : {};
          const deltaKeys = Object.keys(deltas).filter((k) => Number(deltas[k] || 0) !== 0);

          return (
            <li
              key={e.id || String(e.timestamp || Math.random())}
              className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-[0.18em] text-zinc-500">
                    {String(e.source || "SYSTEM")}
                  </span>
                  {e.note ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                      {String(e.note)}
                    </span>
                  ) : null}
                </div>
                <span>{formatTime(e.timestamp)}</span>
              </div>

              {deltaKeys.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {deltaKeys.map((k) => {
                    const n = Number(deltas[k] || 0);
                    const tone = n >= 0 ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-sky-400/25 bg-sky-500/10 text-sky-100";
                    return (
                      <span
                        key={k}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}
                      >
                        {formatDeltaLabel(k, n)}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-zinc-400">No trait deltas recorded.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
