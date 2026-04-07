function resolveAccentClasses(accent = "emerald") {
  const key = String(accent || "emerald")
    .trim()
    .toLowerCase();
  if (key === "amber") {
    return {
      shell:
        "border-amber-300/35 bg-[linear-gradient(180deg,rgba(120,53,15,0.88),rgba(17,24,39,0.96))] text-amber-50",
      chip: "border-amber-300/30 bg-amber-400/12 text-amber-100",
      button:
        "border-amber-300/30 bg-amber-300 text-slate-950 hover:bg-amber-200",
    };
  }
  if (key === "sky") {
    return {
      shell:
        "border-sky-300/35 bg-[linear-gradient(180deg,rgba(12,74,110,0.88),rgba(17,24,39,0.96))] text-sky-50",
      chip: "border-sky-300/30 bg-sky-400/12 text-sky-100",
      button: "border-sky-300/30 bg-sky-300 text-slate-950 hover:bg-sky-200",
    };
  }
  if (key === "rose") {
    return {
      shell:
        "border-rose-300/35 bg-[linear-gradient(180deg,rgba(127,29,29,0.88),rgba(17,24,39,0.96))] text-rose-50",
      chip: "border-rose-300/30 bg-rose-400/12 text-rose-100",
      button: "border-rose-300/30 bg-rose-300 text-slate-950 hover:bg-rose-200",
    };
  }
  return {
    shell:
      "border-emerald-300/35 bg-[linear-gradient(180deg,rgba(6,78,59,0.88),rgba(17,24,39,0.96))] text-emerald-50",
    chip: "border-emerald-300/30 bg-emerald-400/12 text-emerald-100",
    button:
      "border-emerald-300/30 bg-emerald-300 text-slate-950 hover:bg-emerald-200",
  };
}

export default function ShareMomentCard({
  card = null,
  onClose,
  onShare,
  className = "",
}) {
  if (!card || typeof card !== "object") return null;

  const accent = resolveAccentClasses(card.accent);
  const stats = Array.isArray(card.stats) ? card.stats.filter(Boolean) : [];

  return (
    <div
      className={`rounded-[28px] border p-5 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-2xl ${accent.shell} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/68">
            {card.eyebrow || "Doggerz Moment"}
          </div>
          <div className="mt-2 text-xl font-black tracking-tight">
            {card.title || "Shareable moment"}
          </div>
          {card.body ? (
            <div className="mt-2 text-sm leading-6 text-white/84">
              {card.body}
            </div>
          ) : null}
        </div>
        <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
          Share Card
        </div>
      </div>

      {stats.length ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className={`rounded-2xl border px-3 py-2 ${accent.chip}`}
            >
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/60">
                {item.label}
              </div>
              <div className="mt-1 text-sm font-black text-white">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/15 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/88 transition hover:bg-black/30"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onShare}
          className={`rounded-2xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${accent.button}`}
        >
          Share
        </button>
      </div>
    </div>
  );
}
