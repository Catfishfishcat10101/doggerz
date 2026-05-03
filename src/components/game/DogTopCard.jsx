// src/components/game/DogTopCard.jsx
import { formatAge } from "../../utils/timeWeather.js";
import StatPill from "./StatPill.jsx";

export default function DogTopCard({ dog }) {
  return (
    <section className="doggerz-card rounded-[2rem] p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-2xl">
            🐶
          </div>

          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-slate-400">
              Owner
            </p>

            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h2 className="truncate text-2xl font-black tracking-tight text-white">
                {dog.name}
              </h2>

              <p className="text-sm font-black text-slate-300">{dog.owner}</p>
            </div>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              {dog.stage} <span className="text-slate-600">•</span> New Pup{" "}
              <span className="text-slate-600">•</span> {dog.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="Level" value={`Lv ${dog.level}`} />
          <StatPill label="Age" value={formatAge(dog.ageDays)} />
          <StatPill label="Condition" value={dog.condition} />
          <StatPill label="Stage" value={dog.stage} />
        </div>
      </div>
    </section>
  );
}
