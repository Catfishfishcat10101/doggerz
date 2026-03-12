// src/components/ui/modals/FounderBonusModal.jsx

import { useState } from "react";

import ModalSurface from "@/components/ui/modals/ModalSurface.jsx";
import { useToast } from "@/state/toastContext.js";
import { getRuntimeContextLabel } from "@/utils/runtimeContext.js";

export default function FounderBonusModal({
  open = false,
  rewardAmount = 0,
  onClaim = null,
  onClose = null,
}) {
  const [claiming, setClaiming] = useState(false);
  const toast = useToast();
  const runtimeLabel = getRuntimeContextLabel();

  if (!open) return null;

  const coins = Math.max(0, Math.round(Number(rewardAmount || 0)));

  const handleClaim = async () => {
    if (claiming || typeof onClaim !== "function") return;
    setClaiming(true);
    try {
      const ok = await onClaim();
      if (ok) {
        toast.success(`Founder bonus claimed (${runtimeLabel})`);
      } else {
        toast.error(`Founder bonus failed (${runtimeLabel})`);
      }
    } catch (error) {
      console.error(
        "[FounderBonusModal] Failed to claim founder bonus:",
        error
      );
      toast.error(`Founder bonus failed (${runtimeLabel})`);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <ModalSurface
      open={open}
      title="Founder bonus"
      variant="sheet"
      zIndexClass="z-[95]"
      panelClassName="border-amber-300/25 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
    >
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-amber-200">
        Founder Bonus
      </div>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
        Thank you for pre-registering.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
        Your founder gift is ready:{" "}
        <span className="font-semibold text-amber-100">{coins} coins</span>. Use
        it to grab a survival kit, stock premium food, or cover emergency care
        on day one.
      </p>

      <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-400/10 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-amber-100/80">
          Founder reward
        </div>
        <div className="mt-1 text-3xl font-black text-amber-100">
          {coins} coins
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="dz-touch-button rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {claiming ? "Claiming..." : "Claim Founder Bonus"}
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
