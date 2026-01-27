/** @format */
// src/features/game/MechanicsPanel.jsx

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "Soon";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes <= 0) return "Moments";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

export default function MechanicsPanel({
  bondValue = 0,
  streakDays = 0,
  level = 1,
  pottyComplete = false,
  commands = [],
  voiceChance = 0,
  buttonChance = 0,
}) {
  const nextUnlocking = commands.find((c) => c.status === "unlocking");
  const nextLocked = commands.find((c) => c.status === "locked");

  let unlockLine = "All commands unlocked.";
  if (!pottyComplete) {
    unlockLine = "Finish potty training to start unlocking commands.";
  } else if (nextUnlocking) {
    unlockLine = `Next unlock: ${nextUnlocking.label} in ${formatTime(
      nextUnlocking.remainingMs
    )}.`;
  } else if (nextLocked) {
    unlockLine =
      `Next unlock: ${nextLocked.label}. ${nextLocked.detail || ""}`.trim();
  }

  return (
    <section className="rounded-2xl bg-[#0b0f16]/70 ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-xs font-semibold tracking-wide text-white/85">
          Training Intel
        </h3>
        <div className="text-[11px] text-white/45">Hidden mechanics</div>
      </div>

      <div className="p-4 space-y-3 text-sm text-white/70">
        <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
          {unlockLine}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <StatPill label="Bond" value={`${Math.round(bondValue)}%`} />
          <StatPill label="Streak" value={`${Math.max(0, streakDays)} days`} />
          <StatPill label="Level" value={`Lv ${Math.max(1, level)}`} />
          <StatPill
            label="Voice reliability"
            value={`~${Math.round(voiceChance)}%`}
          />
          <StatPill
            label="Button success"
            value={`~${Math.round(buttonChance)}%`}
          />
        </div>

        <ul className="space-y-2 text-[12px] text-white/60">
          <li>Bond directly boosts success and voice reliability.</li>
          <li>
            Unlocks are delayed once requirements are met - stay consistent.
          </li>
          <li>Low energy, hunger, or thirst reduces training success.</li>
          <li>Daily training streaks speed up new trick availability.</li>
        </ul>
      </div>
    </section>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <div className="text-[10px] uppercase tracking-wide text-white/45">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
