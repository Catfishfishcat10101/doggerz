const STAT_LABELS = [
  ["hunger", "Hunger"],
  ["thirst", "Thirst"],
  ["energy", "Energy"],
  ["happiness", "Happiness"],
  ["cleanliness", "Cleanliness"],
  ["health", "Health"],
  ["bond", "Bond"],
];

function ProgressRow({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em]">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200">{value}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-300"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function PupStats({ dog }) {
  return (
    <section className="doggerz-card rounded-[2rem] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
            Pup Stats
          </p>

          <h3 className="mt-1 text-xl font-black text-white">
            {dog.name}&apos;s care sheet
          </h3>
        </div>

        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100">
          🪙 {dog.coins}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STAT_LABELS.map(([key, label]) => (
          <ProgressRow key={key} label={label} value={dog.stats[key]} />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Potty Training
        </p>

        <p className="mt-1 text-sm font-bold text-slate-300">
          Complete potty training first: {dog.pottyProgress || 0}/10.
        </p>
      </div>
    </section>
  );
}
