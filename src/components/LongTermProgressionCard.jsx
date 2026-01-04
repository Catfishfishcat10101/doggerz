// src/components/LongTermProgressionCard.jsx
// @ts-nocheck

function clamp(n, lo = 0, hi = 100) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return Math.max(lo, Math.min(hi, x));
}

function ProgressBar({ value = 0, accent = "bg-emerald-400" }) {
  const v = clamp(value, 0, 100);
  return (
    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full ${accent}`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export default function LongTermProgressionCard({
  progression,
  now = Date.now(),
}) {
  const p = progression || {};
  const season = p.season || {};
  const journey = p.journey || {};
  const daily = p.daily || {};
  const weekly = p.weekly || {};

  const endsAt = Number(season.endsAt || 0);
  const daysLeft = endsAt
    ? Math.max(0, Math.ceil((endsAt - now) / (24 * 60 * 60 * 1000)))
    : null;

  const seasonStep = 100; // mirrors SEASON_LEVEL_XP_STEP
  const journeyStep = 150; // mirrors JOURNEY_LEVEL_XP_STEP

  const seasonXp = Number(season.xp || 0);
  const seasonLevel = Number(season.level || 1);
  const seasonInLevel = seasonXp % seasonStep;
  const seasonPct = (seasonInLevel / seasonStep) * 100;

  const journeyXp = Number(journey.xp || 0);
  const journeyLevel = Number(journey.level || 1);
  const journeyInLevel = journeyXp % journeyStep;
  const journeyPct = (journeyInLevel / journeyStep) * 100;

  const seasonDaily = clamp(daily.seasonXpEarned || 0, 0, 999);
  const journeyDaily = clamp(daily.journeyXpEarned || 0, 0, 999);

  const challenges = Array.isArray(weekly.challenges) ? weekly.challenges : [];

  return (
    <div className="rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.08)] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-emerald-500/10 bg-black/25">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Long-term
        </div>
        <div className="text-lg font-extrabold text-emerald-200">Progress</div>
        <div className="mt-1 text-xs text-zinc-400">
          Built to last weeks and months — not a single weekend binge.
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-extrabold text-zinc-100">Season</div>
            <div className="text-xs text-zinc-400">
              Lvl{" "}
              <span className="text-emerald-200 font-semibold">
                {seasonLevel}
              </span>
              {daysLeft !== null ? (
                <span className="ml-2">• {daysLeft}d left</span>
              ) : null}
            </div>
          </div>
          <div className="mt-2">
            <ProgressBar value={seasonPct} accent="bg-emerald-400" />
            <div className="mt-1 flex justify-between text-[0.72rem] text-zinc-400">
              <span>
                In-level XP: {seasonInLevel}/{seasonStep}
              </span>
              <span>
                Today: {seasonDaily}/{120}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-extrabold text-zinc-100">Journey</div>
            <div className="text-xs text-zinc-400">
              Lvl{" "}
              <span className="text-emerald-200 font-semibold">
                {journeyLevel}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <ProgressBar value={journeyPct} accent="bg-sky-300" />
            <div className="mt-1 flex justify-between text-[0.72rem] text-zinc-400">
              <span>
                In-level XP: {journeyInLevel}/{journeyStep}
              </span>
              <span>
                Today: {journeyDaily}/{40}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-zinc-100">
              Weekly challenges
            </div>
            <div className="text-[0.72rem] text-zinc-400">
              Week of {weekly.weekKey || "—"}
            </div>
          </div>

          {challenges.length ? (
            <ul className="mt-2 space-y-2">
              {challenges.map((c) => {
                const goal = Number(c.goal || 0);
                const progress = clamp(Number(c.progress || 0), 0, goal || 999);
                const done = !!c.claimedAt;
                const pct = goal > 0 ? (progress / goal) * 100 : 0;

                return (
                  <li
                    key={c.id}
                    className={`rounded-2xl border px-3 py-2 ${
                      done
                        ? "border-emerald-500/25 bg-emerald-500/10"
                        : "border-white/10 bg-black/25"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-zinc-200 font-semibold">
                        {c.label}
                      </div>
                      <div
                        className={`text-[0.72rem] ${done ? "text-emerald-200" : "text-zinc-400"}`}
                      >
                        {done ? "Claimed" : `${progress}/${goal}`}
                      </div>
                    </div>
                    <div className="mt-2">
                      <ProgressBar
                        value={pct}
                        accent={done ? "bg-emerald-400" : "bg-white/30"}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-2 text-xs text-zinc-400">
              Weekly challenges will appear after your next session start.
            </div>
          )}

          <div className="mt-3 text-[0.72rem] text-zinc-400">
            Challenges auto-claim on completion. Rewards feed your season +
            journey progress.
          </div>
        </div>
      </div>
    </div>
  );
}
