// _backup/old-src-conflicts/components-game/MemoryMomentToast.jsx
function resolveToneClasses(tone = "emerald") {
  const key = String(tone || "emerald")
    .trim()
    .toLowerCase();
  if (key === "amber" || key === "warning" || key === "gold") {
    return "border-amber-300/35 bg-[linear-gradient(180deg,rgba(251,191,36,0.2),rgba(120,53,15,0.16))] text-amber-50";
  }
  if (key === "sky" || key === "info") {
    return "border-sky-300/35 bg-[linear-gradient(180deg,rgba(56,189,248,0.18),rgba(12,74,110,0.16))] text-sky-50";
  }
  if (key === "rose" || key === "danger") {
    return "border-rose-300/35 bg-[linear-gradient(180deg,rgba(251,113,133,0.2),rgba(127,29,29,0.16))] text-rose-50";
  }
  return "border-emerald-300/30 bg-[linear-gradient(180deg,rgba(52,211,153,0.18),rgba(6,78,59,0.16))] text-emerald-50";
}

export default function MemoryMomentToast({
  moment = null,
  className = "",
  onShare,
  shareLabel = "Share",
}) {
  if (!moment || typeof moment !== "object") return null;
  const interactive = typeof onShare === "function";

  return (
    <div
      className={`${interactive ? "pointer-events-auto" : "pointer-events-none"} rounded-[22px] border px-3.5 py-3 shadow-[0_16px_40px_rgba(2,6,23,0.34)] backdrop-blur-xl ${resolveToneClasses(moment.tone)} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/18 bg-black/15 text-sm">
          {moment.icon || "🐾"}
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
            {moment.eyebrow || "Memory Moment"}
          </div>
          <div className="mt-1 text-sm font-black tracking-[0.01em]">
            {moment.title || "A small moment"}
          </div>
          {moment.body ? (
            <div className="mt-1 text-[11px] leading-4 text-white/82">
              {moment.body}
            </div>
          ) : null}
          {interactive ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={onShare}
                className="pointer-events-auto rounded-full border border-white/15 bg-black/18 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/88 transition hover:bg-black/28"
              >
                {shareLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
