function resolveToneClasses(tone = "emerald") {
  const key = String(tone || "emerald")
    .trim()
    .toLowerCase();
  if (key === "warning") {
    return "border-amber-300/35 bg-[linear-gradient(180deg,rgba(251,191,36,0.2),rgba(120,53,15,0.16))] text-amber-50";
  }
  if (key === "danger") {
    return "border-rose-300/35 bg-[linear-gradient(180deg,rgba(251,113,133,0.2),rgba(127,29,29,0.16))] text-rose-50";
  }
  if (key === "sky") {
    return "border-sky-300/35 bg-[linear-gradient(180deg,rgba(56,189,248,0.18),rgba(12,74,110,0.16))] text-sky-50";
  }
  return "border-emerald-300/30 bg-[linear-gradient(180deg,rgba(52,211,153,0.18),rgba(6,78,59,0.16))] text-emerald-50";
}

export default function MoodBadge({
  label = "Calm",
  hint = "Relaxed and settled.",
  accent = "Easygoing",
  tone = "emerald",
  className = "",
}) {
  return (
    <div
      className={`pointer-events-none rounded-[22px] border px-3.5 py-3 shadow-[0_16px_40px_rgba(2,6,23,0.32)] backdrop-blur-xl ${resolveToneClasses(tone)} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
            Mood
          </div>
          <div className="mt-1 text-sm font-black tracking-[0.01em]">
            {label}
          </div>
        </div>
        <div className="rounded-full border border-white/12 bg-black/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/75">
          {accent}
        </div>
      </div>
      <div className="mt-2 text-[11px] leading-4 text-white/84">{hint}</div>
    </div>
  );
}
