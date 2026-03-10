import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { showRewardedAd } from "@/features/ads/AdManager.js";
import { getDailyRewardState } from "@/features/game/dailyRewards.js";
import { claimDailyReward } from "@/redux/dogSlice.js";
import { useDog } from "@/hooks/useDogState.js";

function buildRewardWithMultiplier(reward, multiplier) {
  if (!reward || typeof reward !== "object") return null;
  const factor = Math.max(1, Math.floor(Number(multiplier) || 1));
  const value = Math.max(0, Math.round(Number(reward.value || 0) * factor));
  const type = String(reward.type || "").toUpperCase();

  let label = reward.label || "Reward";
  if (factor > 1) {
    if (type === "COINS") label = `${value} Coins`;
    if (type === "ENERGY") label = `+${value} Energy`;
  }

  return {
    ...reward,
    value,
    label,
  };
}

export default function DailyRewardModal({
  open = false,
  onClose = null,
  rewardState = null,
}) {
  const dispatch = useDispatch();
  const dog = useDog();
  const [adBusy, setAdBusy] = useState(false);

  const resolvedRewardState = useMemo(
    () =>
      rewardState ||
      getDailyRewardState({
        lastRewardClaimedAt: dog?.lastRewardClaimedAt,
        consecutiveDays: dog?.consecutiveDays,
        now: Date.now(),
      }),
    [dog?.consecutiveDays, dog?.lastRewardClaimedAt, rewardState]
  );

  if (!open) return null;

  const streakDays = Math.max(0, Math.floor(Number(dog?.consecutiveDays || 0)));
  const canClaim = resolvedRewardState?.canClaim === true;
  const reward = resolvedRewardState?.reward || null;
  const nextStreakDay = Number(resolvedRewardState?.nextStreakDay || 1);

  const handleClaim = (multiplier = 1) => {
    if (!canClaim || !reward) return;
    dispatch(
      claimDailyReward({
        day: nextStreakDay,
        reward: buildRewardWithMultiplier(reward, multiplier),
        now: Date.now(),
      })
    );
    if (typeof onClose === "function") onClose();
  };

  const handleClaimDouble = async () => {
    if (!canClaim || !reward || adBusy) return;
    setAdBusy(true);
    try {
      const completed = await showRewardedAd();
      if (completed) {
        handleClaim(2);
      }
    } finally {
      setAdBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Daily reward"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-zinc-950 p-6 text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">
          Daily Reward
        </div>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
          {streakDays > 0
            ? `${streakDays}-day streak. Keep it going.`
            : "First day bonus ready."}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Day {nextStreakDay} reward:{" "}
          <span className="font-semibold text-emerald-200">
            {reward?.label || "Reward"}
          </span>
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Current streak
          </div>
          <div className="mt-1 text-3xl font-black text-emerald-200">
            {streakDays} days
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleClaim(1)}
            disabled={!canClaim || adBusy}
            className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Claim
          </button>
          <button
            type="button"
            onClick={handleClaimDouble}
            disabled={!canClaim || adBusy}
            className="rounded-2xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-sm font-black text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adBusy ? "Loading Ad..." : "Claim DOUBLE (Ad)"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof onClose === "function") onClose();
            }}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
