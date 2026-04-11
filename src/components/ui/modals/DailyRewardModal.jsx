import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import ModalSurface from "@/components/ui/modals/ModalSurface.jsx";
import { showRewardedAd } from "@/features/ads/AdManager.js";
import { getDailyRewardState } from "@/features/billing/dailyRewards.js";
import { claimDailyReward } from "@/store/dogSlice.js";
import { useDog } from "@/hooks/useDogState.js";
import { useToast } from "@/state/toastContext.js";
import { getRuntimeContextLabel } from "@/utils/runtimeContext.js";

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
  const toast = useToast();
  const [adBusy, setAdBusy] = useState(false);
  const runtimeLabel = getRuntimeContextLabel();

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
    if (!canClaim || !reward) {
      toast.error(`Claim failed (${runtimeLabel})`);
      return false;
    }
    try {
      const rewardPayload = buildRewardWithMultiplier(reward, multiplier);
      dispatch(
        claimDailyReward({
          day: nextStreakDay,
          reward: rewardPayload,
          now: Date.now(),
        })
      );
      toast.success(
        `Claimed ${rewardPayload?.label || "reward"} (${runtimeLabel})`
      );
      if (typeof onClose === "function") onClose();
      return true;
    } catch (error) {
      console.error("[DailyRewardModal] Failed to claim daily reward:", error);
      toast.error(`Claim failed (${runtimeLabel})`);
      return false;
    }
  };

  const handleClaimDouble = async () => {
    if (!canClaim || !reward || adBusy) return;
    setAdBusy(true);
    try {
      const completed = await showRewardedAd();
      if (completed) {
        handleClaim(2);
      } else {
        toast.error(`Double claim canceled (${runtimeLabel})`);
      }
    } catch (error) {
      console.error("[DailyRewardModal] Rewarded ad flow failed:", error);
      toast.error(`Double claim failed (${runtimeLabel})`);
    } finally {
      setAdBusy(false);
    }
  };

  return (
    <ModalSurface open={open} title="Daily reward" variant="sheet">
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
          className="dz-touch-button rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          Claim
        </button>
        <button
          type="button"
          onClick={handleClaimDouble}
          disabled={!canClaim || adBusy}
          className="dz-touch-button rounded-2xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-sm font-black text-amber-100 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adBusy ? "Loading Ad..." : "Claim DOUBLE (Ad)"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof onClose === "function") onClose();
          }}
          className="dz-touch-button rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition"
        >
          Later
        </button>
      </div>
    </ModalSurface>
  );
}
