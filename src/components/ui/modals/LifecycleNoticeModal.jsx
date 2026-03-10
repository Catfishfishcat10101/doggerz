import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ModalSurface from "@/components/ui/modals/ModalSurface.jsx";
import { PATHS } from "@/routes.js";

const RESCUE_HOLD_MS = 24 * 60 * 60 * 1000;

function formatCountdown(ms) {
  const totalMinutes = Math.max(0, Math.ceil(Number(ms || 0) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export default function LifecycleNoticeModal({
  open = false,
  lifecycleStatus = "NONE",
  dog = null,
}) {
  const status = String(lifecycleStatus || "NONE").toUpperCase();
  const isRescued = status === "RESCUED";
  const isFarewell = status === "FAREWELL";
  const lastName =
    dog?.legacyJourney?.previousDogs?.[0]?.name || dog?.name || "your pup";
  const dangerScore = Number(dog?.danger?.score || 0);
  const rescuedAt = Number(dog?.danger?.rescuedAt || 0);
  const rescueReleaseAt = rescuedAt > 0 ? rescuedAt + RESCUE_HOLD_MS : 0;
  const [now, setNow] = useState(() => Date.now());
  const rescueHoldRemainingMs = Math.max(0, rescueReleaseAt - now);
  const rescueHoldActive = isRescued && rescueHoldRemainingMs > 0;

  useEffect(() => {
    if (!open || !isRescued || !rescueReleaseAt) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, [isRescued, open, rescueReleaseAt]);

  if (!open) return null;

  return (
    <ModalSurface
      open={open}
      title={isRescued ? "Animal Rescue Center" : "Legacy Milestone"}
      zIndexClass="z-[92]"
      panelClassName="max-w-lg bg-zinc-950/92 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
    >
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
        {isRescued ? "Animal Rescue Center" : "Legacy Milestone"}
      </div>
      <h2 className="mt-2 text-xl font-extrabold text-emerald-200">
        {isRescued
          ? `${lastName} has been taken into protective care`
          : "Farewell letter received"}
      </h2>
      <p className="mt-3 text-sm text-zinc-300">
        {isRescued
          ? `Danger meter reached ${dangerScore}%. Early severe mistreatment triggered intervention.`
          : "Your pup lived a long life. Rainbow Bridge is now available, and a ghost-dog play bow is queued for your next adoption."}
      </p>
      {rescueHoldActive ? (
        <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200/80">
            Protective hold
          </div>
          <div className="mt-1 text-lg font-extrabold text-amber-100">
            I&apos;ll be back in {formatCountdown(rescueHoldRemainingMs)}... if
            I feel like it.
          </div>
          <p className="mt-2 text-xs text-amber-100/80">
            Care actions, coin gain, and fresh adoption stay locked during the
            24 hour hold.
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {isFarewell ? (
          <Link
            to={PATHS.RAINBOW_BRIDGE}
            className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
          >
            Open Rainbow Bridge
          </Link>
        ) : null}
        {rescueHoldActive ? (
          <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-500">
            Adoption locked
          </span>
        ) : (
          <Link
            to={PATHS.ADOPT}
            className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Adopt a new pup
          </Link>
        )}
        <Link
          to={PATHS.MEMORIES}
          className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
        >
          Read letters
        </Link>
      </div>
    </ModalSurface>
  );
}
