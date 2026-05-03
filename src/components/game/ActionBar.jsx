// src/components/game/ActionBar.jsx
const ACTIONS = [
  {
    id: "feed",
    icon: "🥩",
    label: "Quick Feed",
    subtext: "Top off hunger",
  },
  {
    id: "pet",
    icon: "💛",
    label: "Pet",
    subtext: "Tap-time affection",
  },
  {
    id: "care",
    icon: "✨",
    label: "Care Memo",
    subtext: "Open full sheet",
  },
  {
    id: "train",
    icon: "🎯",
    label: "Train",
    subtext: "Potty first",
  },
  {
    id: "sleep",
    icon: "🌙",
    label: "Nap",
    subtext: "Restore energy",
  },
];

export default function ActionBar({ onAction }) {
  return (
    <section className="doggerz-card rounded-[2rem] p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
        Interactions
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/12 text-xl">
                {action.icon}
              </span>

              <span>
                <span className="block text-sm font-black text-white">
                  {action.label}
                </span>

                <span className="block text-xs font-bold text-slate-400">
                  {action.subtext}
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
