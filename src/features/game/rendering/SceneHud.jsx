// src/features/game/rendering/SceneHud.jsx
function getToneClasses(tone = "neutral") {
  const key = String(tone || "neutral")
    .trim()
    .toLowerCase();
  if (key === "sky") {
    return "border-sky-200/25 bg-sky-300/12 text-sky-50";
  }
  if (key === "emerald" || key === "success") {
    return "border-emerald-200/25 bg-emerald-300/12 text-emerald-50";
  }
  if (key === "warning" || key === "amber") {
    return "border-amber-200/25 bg-amber-300/12 text-amber-50";
  }
  if (key === "danger" || key === "rose") {
    return "border-rose-200/25 bg-rose-300/12 text-rose-50";
  }
  return "border-white/12 bg-black/28 text-white/82";
}

function SceneHudPill({ item }) {
  return (
    <div
      className={`inline-flex min-h-[34px] items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_rgba(2,6,23,0.24)] backdrop-blur-md ${getToneClasses(item?.tone)}`}
    >
      <span className="text-white/55">{item?.label}</span>
      <span className="max-w-[40vw] truncate text-white">{item?.value}</span>
    </div>
  );
}

export default function SceneHud({ leftItems = [], rightItems = [] }) {
  const left = Array.isArray(leftItems) ? leftItems.filter(Boolean) : [];
  const right = Array.isArray(rightItems) ? rightItems.filter(Boolean) : [];

  if (!left.length && !right.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[34] flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
        {left.map((item) => (
          <SceneHudPill key={`${item.label}-${item.value}`} item={item} />
        ))}
      </div>
      <div className="flex min-w-0 flex-wrap justify-end gap-1.5 sm:gap-2">
        {right.map((item) => (
          <SceneHudPill key={`${item.label}-${item.value}`} item={item} />
        ))}
      </div>
    </div>
  );
}
