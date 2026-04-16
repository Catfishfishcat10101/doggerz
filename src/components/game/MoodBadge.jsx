function resolveToneClasses(tone = "emerald") {
  const key = String(tone || "emerald")
    .trim()
    .toLowerCase();
  if (key === "warning") {
    return "border-amber-300/35 bg-amber-400/12 text-amber-50";
  }
  if (key === "danger") {
    return "border-rose-300/35 bg-rose-400/12 text-rose-50";
  }
  if (key === "sky") {
    return "border-sky-300/35 bg-sky-400/12 text-sky-50";
  }
  return "border-emerald-300/30 bg-emerald-400/10 text-emerald-50";
}

export default function MoodBadge({
  label = "Calm",
  hint = "Relaxed and settled.",
  accent = "Easygoing",
  tone = "emerald",
  badges = [],
  className = "",
}) {
  return (
    <div
      className={`pointer-events-none rounded-[20px] border px-3 py-2.5 shadow-[0_10px_28px_rgba(2,6,23,0.28)] ring-1 ring-inset ring-white/5 backdrop-blur-md ${resolveToneClasses(tone)} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/62">
            Mood
          </div>
          <div className="mt-1 text-[15px] font-black leading-none tracking-[0.01em]">
            {label}
          </div>
        </div>
        <div className="rounded-full border border-white/12 bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/78">
          {accent}
        </div>
      </div>
      {hint ? (
        <div className="mt-1.5 text-[11px] leading-4 text-white/78">{hint}</div>
      ) : null}
      {Array.isArray(badges) && badges.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <div
              key={badge.key || badge.label}
              className="rounded-full border border-white/12 bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/82"
              title={badge.detail || badge.label}
            >
              <span className="mr-1" aria-hidden="true">
                {badge.icon || "✨"}
              </span>
              {badge.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
