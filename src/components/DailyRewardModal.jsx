/** @format */

import { DAILY_REWARD_SCHEDULE } from "@/features/game/dailyRewards.js";

function isCurrentDay(day, currentDay) {
  const total = DAILY_REWARD_SCHEDULE.length || 1;
  const normalized = ((Math.max(1, Number(currentDay) || 1) - 1) % total) + 1;
  return Number(day) === normalized;
}

export default function DailyRewardModal({
  open,
  rewardState,
  onClaim,
  onClose,
}) {
  if (!open) return null;

  const canClaim = rewardState?.canClaim === true;
  const nextStreakDay = Number(rewardState?.nextStreakDay || 1);
  const rewardLabel = rewardState?.reward?.label || "Reward";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Daily reward"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close daily reward"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-emerald-300/30 bg-zinc-950/95 p-5 shadow-2xl shadow-black/50">
        <h2 className="text-2xl font-black tracking-tight text-emerald-200">
          Daily Reward
        </h2>
        <p className="mt-1 text-sm text-zinc-300">
          Day {nextStreakDay}:{" "}
          <span className="font-semibold">{rewardLabel}</span>
        </p>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {DAILY_REWARD_SCHEDULE.map((item) => {
            const active = isCurrentDay(item.day, nextStreakDay);
            return (
              <div
                key={item.day}
                className={[
                  "rounded-xl border px-2 py-2 text-center text-[11px]",
                  active
                    ? "border-emerald-300/70 bg-emerald-500/20 text-emerald-100"
                    : "border-white/10 bg-white/5 text-zinc-300",
                ].join(" ")}
              >
                <div className="font-semibold">D{item.day}</div>
                <div className="mt-1">
                  {item.type === "COINS" ? "Coins" : "Energy"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-black/35"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onClaim}
            disabled={!canClaim}
            className="flex-1 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  );
}
