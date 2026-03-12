/** @format */

// src/components/dog/DreamJournal.jsx

function formatWhen(ts) {
  const n = Number(ts || 0);
  if (!n) return "";
  try {
    return new Date(n).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getKindTone(kind) {
  const k = String(kind || "").toLowerCase();
  if (k === "lucid") {
    return {
      chip: "dz-dog-chip dz-dog-chip--emerald",
      card: "border-emerald-400/25",
    };
  }
  if (k === "nightmare") {
    return {
      chip: "dz-dog-chip dz-dog-chip--fuchsia",
      card: "border-fuchsia-400/25",
    };
  }
  return {
    chip: "dz-dog-chip dz-dog-chip--sky",
    card: "border-sky-400/25",
  };
}

export default function DreamJournal({ dreams = [] }) {
  const list = Array.isArray(dreams) ? dreams : [];

  if (!list.length) return null;

  return (
    <div className="space-y-3">
      {list.map((dream, idx) => {
        const kind = String(dream?.kind || "dream").toLowerCase();
        const tone = getKindTone(kind);
        const title =
          String(dream?.title || "").trim() ||
          (kind === "lucid"
            ? "Lucid dream"
            : kind === "nightmare"
              ? "Nightmare"
              : "Dream");
        const summary =
          String(dream?.summary || "").trim() ||
          String(dream?.description || "").trim() ||
          "A strange little story from sleep.";
        const motifs = Array.isArray(dream?.motifs)
          ? dream.motifs.filter(Boolean).map((m) => String(m))
          : [];
        const sourceMemory = String(dream?.sourceMemory || "")
          .trim()
          .replace(/_/g, " ");
        const emotion = String(dream?.emotion || "").trim();
        const when = formatWhen(dream?.timestamp);
        const key = dream?.id || `${Number(dream?.timestamp || 0)}-${idx}`;

        return (
          <article key={key} className={`dz-dog-panel p-4 ${tone.card}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-zinc-100">{title}</h3>
              <span className={tone.chip}>{kind}</span>
            </div>

            <p className="mt-2 text-sm text-zinc-300">{summary}</p>

            {motifs.length ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {motifs.map((motif) => (
                  <span key={motif} className="dz-dog-tag">
                    {motif}
                  </span>
                ))}
              </div>
            ) : null}

            {sourceMemory || emotion ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {sourceMemory ? (
                  <span className="dz-dog-tag">From {sourceMemory}</span>
                ) : null}
                {emotion ? <span className="dz-dog-tag">{emotion}</span> : null}
              </div>
            ) : null}

            {when ? (
              <div className="mt-3 text-[11px] text-zinc-500">{when}</div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
