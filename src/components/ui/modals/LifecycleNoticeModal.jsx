import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ModalSurface from "@/components/ui/modals/ModalSurface.jsx";
import { PATHS } from "@/app/routes.js";

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
  onClose = null,
}) {
  const navigate = useNavigate();
  const status = String(lifecycleStatus || "NONE").toUpperCase();
  const isRescued = status === "RESCUED";
  const isFarewell = status === "FAREWELL";
  const lastName =
    dog?.legacyJourney?.previousDogs?.[0]?.name || dog?.name || "your pup";
  const dangerScore = Number(dog?.danger?.score || 0);
  const rescueReason = String(dog?.danger?.rescueReason || "").trim();
  const rescuedAt = Number(dog?.danger?.rescuedAt || 0);
  const rescueReleaseAt = rescuedAt > 0 ? rescuedAt + RESCUE_HOLD_MS : 0;
  const [now, setNow] = useState(() => Date.now());
  const rescueHoldRemainingMs = Math.max(0, rescueReleaseAt - now);
  const rescueHoldActive = isRescued && rescueHoldRemainingMs > 0;

  const handleNavigate = (path) => {
    if (!path) return;
    if (typeof onClose === "function") onClose();
    window.setTimeout(() => {
      navigate(path);
    }, 0);
  };

  useEffect(() => {
    if (!open || !isRescued || !rescueReleaseAt) return undefined;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, [isRescued, open, rescueReleaseAt]);

  if (!open) return null;

  if (isFarewell) {
    return (
      <div
        className="fixed inset-0 z-[92] flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,rgba(110,231,183,0.18),transparent_28%),linear-gradient(180deg,rgba(12,24,42,0.98),rgba(18,8,34,0.98))] px-5 py-8"
        role="dialog"
        aria-modal="true"
        aria-label="Rainbow Bridge"
      >
        <div className="w-full max-w-2xl rounded-[32px] border border-emerald-300/25 bg-black/25 p-6 text-zinc-100 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="text-xs uppercase tracking-[0.22em] text-emerald-200/78">
            180-day legacy milestone
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-100 sm:text-4xl">
            {lastName} reached Rainbow Bridge
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-200 sm:text-base">
            Your pup made it through the full 180-day journey. This is the clean
            end of the run: gameplay pauses here, Rainbow Bridge is open, and
            their legacy bonus is waiting for the next adoption.
          </p>

          <div className="mt-5 rounded-3xl border border-emerald-300/25 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-50">
            Thank you for every walk, toy, nap, and tiny act of chaos control.
            This is the hard-earned win state.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleNavigate(PATHS.RAINBOW_BRIDGE)}
              className="dz-touch-button rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
            >
              Open Rainbow Bridge
            </button>
            <button
              type="button"
              onClick={() => handleNavigate(PATHS.MEMORIES)}
              className="dz-touch-button rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100"
            >
              Read letters
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof onClose === "function") onClose();
              }}
              className="dz-touch-button rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-zinc-300"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModalSurface
      open={open}
      onClose={onClose}
      title={isRescued ? "Animal Rescue Center" : "Rainbow Bridge"}
      zIndexClass="z-[92]"
      panelClassName={
        isRescued
          ? "max-w-lg border-red-400/25 bg-[linear-gradient(180deg,rgba(80,10,10,0.96),rgba(20,0,0,0.94))] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
          : "max-w-lg border-emerald-300/20 bg-[linear-gradient(180deg,rgba(12,24,42,0.96),rgba(18,8,34,0.94))] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
      }
    >
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
        {isRescued ? "Protective intervention" : "180-day legacy milestone"}
      </div>
      <h2 className="mt-2 text-xl font-extrabold text-emerald-200">
        {isRescued
          ? `${lastName} has been taken into protective care`
          : `${lastName} reached Rainbow Bridge`}
      </h2>
      <p className="mt-3 text-sm text-zinc-300">
        {isRescued
          ? rescueReason ||
            `Danger meter reached ${dangerScore}%. Severe neglect triggered intervention before things got worse.`
          : "Your pup made it through the full 180-day journey. Rainbow Bridge is open now, and their legacy bonus is queued for your next adoption."}
      </p>
      {isRescued ? (
        <div className="mt-4 rounded-2xl border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-50">
          Daily feeding and check-ins matter now. Miss too many, and Animal
          Rescue Center will step in before the story can reach Rainbow Bridge.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
          This is the hard-earned win state: your pup survived the full
          six-month run and leaves behind generational wisdom for the next dog.
        </div>
      )}
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
          <button
            type="button"
            onClick={() => handleNavigate(PATHS.RAINBOW_BRIDGE)}
            className="dz-touch-button rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
          >
            Open Rainbow Bridge
          </button>
        ) : null}
        {rescueHoldActive ? (
          <span className="cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-500">
            Adoption locked
          </span>
        ) : (
          <button
            type="button"
            onClick={() => handleNavigate(PATHS.ADOPT)}
            className="dz-touch-button rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100"
          >
            Adopt a new pup
          </button>
        )}
        <button
          type="button"
          onClick={() => handleNavigate(PATHS.MEMORIES)}
          className="dz-touch-button rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100"
        >
          Read letters
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof onClose === "function") onClose();
          }}
          className="dz-touch-button rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-zinc-300"
        >
          Back
        </button>
      </div>
    </ModalSurface>
  );
}
