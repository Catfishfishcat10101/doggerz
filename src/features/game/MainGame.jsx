// src/features/game/MainGame.jsx
<<<<<<< HEAD
// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import GameTopBar from "@/features/game/components/GameTopBar.jsx";
import DogPixiView from "@/features/game/components/DogPixiView.jsx";
import AnimatedDog from "@/components/AnimatedDog.jsx";
import RealisticDog from "@/components/RealisticDog.jsx";
import LottieBurst from "@/components/ui/LottieBurst.jsx";
import pulseAnim from "@/assets/lottie/doggerz-pulse.json";
import LongTermProgressionCard from "@/components/LongTermProgressionCard.jsx";
import DogPollCard from "@/components/DogPollCard.jsx";
import PottyTrackerCard from "@/components/PottyTrackerCard.jsx";
import { selectDogRenderModel } from "@/features/dog/dogSelectors.js";
import { selectDogRenderMode } from "@/redux/userSlice.js";
import {
  bathe,
  feed,
  goPotty,
  increasePottyLevel,
  play,
  respondToDogPoll,
  trainObedience,
} from "@/redux/dogSlice.js";

function clamp01(n) {
  const x = Number(n || 0);
  return Math.max(0, Math.min(100, x));
}

function StatRow({ label, value }) {
  const v = clamp01(value);
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs sm:text-sm text-zinc-300">{label}</div>
      <div className="flex-1 h-3.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${v}%` }}
        />
      </div>
      <div className="w-12 text-right text-xs sm:text-sm font-semibold text-zinc-200">
        {v}%
=======
// AAA-ish Backyard Sim screen (day/night background, HUD, action dock)
// @ts-nocheck

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { auth, firebaseReady } from "@/firebase.js";
import { signOut } from "firebase/auth";

import GameTopBar from "@/features/game/GameTopBar.jsx";
import NeedsHUD from "@/features/game/NeedsHUD.jsx";
import MoodAndJournalPanel from "@/features/game/MoodAndJournalPanel.jsx";
import TemperamentCard from "@/features/game/TemperamentCard.jsx";
import useDayNightBackground from "@/features/game/useDayNightBackground.jsx";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";

import WeatherFXCanvas from "@/features/game/components/WeatherFXCanvas.jsx";
import YardSetDressing from "@/features/game/components/YardSetDressing.jsx";
import { useYardSfx } from "@/features/game/components/useYardSfx.js";
import { useSleepAudio } from "@/features/game/components/useSleepAudio.js";
import YardDogActor from "@/features/game/components/YardDogActor.jsx";
import TrainingPanel from "@/features/game/TrainingPanel.jsx";

import { useToast } from "@/components/ToastProvider.jsx";
import { collectEarnedBadgeIds } from "@/utils/badges.js";

import {
  selectDog,
  selectDogStats,
  selectDogLifeStage,
  selectDogTraining,
  selectDogCleanlinessTier,
  selectDogXpProgress,
  selectNextStreakReward,
  setDogName,
  setOnboardingStep,
  grantOnboardingReward,
  feed,
  play,
  pet,
  bathe,
  goPotty,
  trainObedience,
  debugSetEnergy,
  debugSetAsleep,
  resetDogState,
  DOG_STORAGE_KEY,
} from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { clearUser, selectUserZip, selectUserCoins } from "@/redux/userSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";

import { getSpriteForStageAndTier } from "@/utils/lifecycle.js";
import { withBaseUrl } from "@/utils/assetUrl.js";

import jrtAnimSpec from "@/features/game/sprites/jrtAnimSpec.json";
import { loadJrtManifest } from "@/features/game/sprites/jrtSpriteManifest.js";

const ONBOARDING_V2_KEY = "doggerz:onboarding:v2:dismissed";
const HYDRATE_ERROR_KEY = "doggerz:hydrateError";

const ENGINE_TICK_INTERVAL_MS = 60_000;

function formatAgo(ms) {
  const t = Number(ms);
  if (!Number.isFinite(t) || t <= 0) return "—";
  const dt = Date.now() - t;
  if (!Number.isFinite(dt) || dt < 0) return "—";
  const s = Math.floor(dt / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function DebugPanel({ open, onClose, dog, stats, settings, env, sprite }) {
  const dispatch = useDispatch();
  const [manifest, setManifest] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadJrtManifest().then((m) => {
      if (cancelled) return;
      setManifest(m || null);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const stageKey = String(sprite?.stage || dog?.lifeStage?.stage || 'PUPPY').toUpperCase();
  const manifestStage = manifest?.stages?.[stageKey];
  const manifestAnims = manifestStage?.anims ? Object.keys(manifestStage.anims) : [];

  const requiredCore = Array.isArray(jrtAnimSpec?.groups?.core?.anims)
    ? jrtAnimSpec.groups.core.anims
    : [];

  const missingCore = requiredCore.filter((a) => !manifestAnims.includes(a));
  return (
    <div className="fixed bottom-4 right-4 z-[80] w-[min(520px,calc(100%-2rem))]">
      <div className="rounded-3xl border border-white/15 bg-black/70 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">Debug</div>
            <div className="text-sm font-extrabold text-emerald-200">Game state</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs text-zinc-200/90">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-zinc-400">Core</div>
              <div className="mt-1 space-y-1">
                <div>Level: <span className="font-semibold text-emerald-200">{dog?.level ?? "—"}</span></div>
                <div>XP: <span className="font-semibold">{dog?.xp ?? "—"}</span></div>
                <div>Coins: <span className="font-semibold">{dog?.coins ?? "—"}</span></div>
                <div>Last action: <span className="font-semibold">{dog?.lastAction ?? "—"}</span></div>
                <div>Last updated: <span className="font-semibold">{formatAgo(dog?.lastUpdatedAt)}</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-zinc-400">Stats</div>
              <div className="mt-1 space-y-1">
                <div>Hunger: <span className="font-semibold">{Math.round(stats?.hunger ?? 0)}</span></div>
                <div>Happiness: <span className="font-semibold">{Math.round(stats?.happiness ?? 0)}</span></div>
                <div>Energy: <span className="font-semibold">{Math.round(stats?.energy ?? 0)}</span></div>
                <div>Cleanliness: <span className="font-semibold">{Math.round(stats?.cleanliness ?? 0)}</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-zinc-400">Progress + ticks</div>
            <div className="mt-1 space-y-1">
              <div>
                Last XP: <span className="font-semibold">{dog?.progress?.lastXpGain?.amount ?? "—"}</span>
                {dog?.progress?.lastXpGain?.reason ? (
                  <span className="text-zinc-400"> ({String(dog.progress.lastXpGain.reason).toLowerCase()})</span>
                ) : null}
                <span className="text-zinc-400"> • {formatAgo(dog?.progress?.lastXpGain?.at)}</span>
              </div>
              <div>
                Last level up: <span className="font-semibold">{dog?.progress?.lastLevelUp?.toLevel ?? "—"}</span>
                {dog?.progress?.lastLevelUp?.reason ? (
                  <span className="text-zinc-400"> ({String(dog.progress.lastLevelUp.reason).toLowerCase()})</span>
                ) : null}
                <span className="text-zinc-400"> • {formatAgo(dog?.progress?.lastLevelUp?.at)}</span>
              </div>
              <div>
                Engine tick: <span className="font-semibold">{Math.round((ENGINE_TICK_INTERVAL_MS || 0) / 1000)}s</span>
                <span className="text-zinc-400"> • last tick {formatAgo(dog?.meta?.lastTickAt)}</span>
              </div>
              <div>
                Session start: <span className="text-zinc-400">{formatAgo(dog?.meta?.lastSessionStartAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-zinc-400">Sleep / testing</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <div>isAsleep: <span className="font-semibold">{dog?.isAsleep ? "true" : "false"}</span></div>
                <div>intent: <span className="font-semibold">{sprite?.intent ?? "—"}</span></div>
              </div>
              <div>
                <div>energy: <span className="font-semibold">{Math.round(stats?.energy ?? 0)}</span></div>
                <div>lastAction: <span className="font-semibold">{dog?.lastAction ?? "—"}</span></div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch(debugSetEnergy({ energy: 5, now: Date.now() }))}
                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
              >
                Energy 5
              </button>
              <button
                type="button"
                onClick={() => dispatch(debugSetEnergy({ energy: 15, now: Date.now() }))}
                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
              >
                Energy 15
              </button>
              <button
                type="button"
                onClick={() => dispatch(debugSetEnergy({ energy: 85, now: Date.now() }))}
                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
              >
                Energy 85
              </button>

              <span className="mx-1 w-px bg-white/10" />

              <button
                type="button"
                onClick={() => dispatch(debugSetAsleep({ isAsleep: true, now: Date.now() }))}
                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-emerald-400/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
              >
                Force sleep
              </button>
              <button
                type="button"
                onClick={() => dispatch(debugSetAsleep({ isAsleep: false, now: Date.now() }))}
                className="rounded-2xl px-3 py-2 text-xs font-semibold border border-amber-400/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15 transition"
              >
                Force wake
              </button>
            </div>

            <div className="mt-2 text-[11px] text-zinc-400">
              Tip: set Energy 5, then switch back to the yard — the dog should visually sleep immediately.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-zinc-400">Environment</div>
            <div className="mt-1 space-y-1">
              <div>Weather: <span className="font-semibold">{env?.weather ?? "—"}</span></div>
              <div>Time bucket: <span className="font-semibold">{env?.timeOfDayBucket ?? "—"}</span></div>
              <div>Night: <span className="font-semibold">{env?.isNight ? "yes" : "no"}</span></div>
              <div>reduceMotion: <span className="font-semibold">{env?.reduceMotion ? "on" : "off"}</span></div>
              <div>reduceTransparency: <span className="font-semibold">{env?.reduceTransparency ? "on" : "off"}</span></div>
              <div>batterySaver: <span className="font-semibold">{settings?.batterySaver ? "on" : "off"}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <div className="text-zinc-400">Sprite animations</div>
            <div className="mt-1 space-y-1">
              <div>
                Stage: <span className="font-semibold">{stageKey}</span>
                <span className="text-zinc-400"> • intent </span>
                <span className="font-semibold">{sprite?.intent ?? '—'}</span>
                {sprite?.commandId ? (
                  <span className="text-zinc-400"> • cmd <span className="font-semibold text-zinc-200">{sprite.commandId}</span></span>
                ) : null}
              </div>

              <div>
                Manifest: <span className={`font-semibold ${manifest ? 'text-emerald-200' : 'text-amber-200'}`}>{manifest ? 'loaded' : 'missing'}</span>
                {manifestStage?.base ? (
                  <span className="text-zinc-400"> • base {manifestStage.base}</span>
                ) : null}
              </div>

              {!manifest ? (
                <div className="text-zinc-400">
                  No manifest found. Add real frames and run <span className="font-semibold">sprites:jrt:build</span>.
                </div>
              ) : missingCore.length ? (
                <div>
                  <div className="text-amber-200 font-semibold">Missing core anim(s):</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {missingCore.slice(0, 18).map((a) => (
                      <span key={a} className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-100">
                        {a}
                      </span>
                    ))}
                    {missingCore.length > 18 ? (
                      <span className="text-zinc-400 text-[11px]">+{missingCore.length - 18} more</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-emerald-200 font-semibold">Core set present ✅</div>
              )}
            </div>
          </div>
        </div>
>>>>>>> master
      </div>
    </div>
  );
}

<<<<<<< HEAD
function Icon({ name }) {
  const cls = "h-5 w-5";
  // Minimal inline SVG set (no extra deps)
  if (name === "bowl") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12c0 4 3.6 7 8 7s8-3 8-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 12c1.8-2 4-3 6-3s4.2 1 6 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M5 20h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "ball") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4.5 10.5c2 1 4.5 1.5 7.5 1.5s5.5-.5 7.5-1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 15.5c2 .8 4 .5 6-.8s4-1.6 6-.7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "sparkle") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l1.2 5.1L18 9.3l-4.8 1.2L12 15l-1.2-4.5L6 9.3l4.8-1.2L12 3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M19 13l.6 2.4L22 16l-2.4.6L19 19l-.6-2.4L16 16l2.4-.6L19 13z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "toilet") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none">
        <path d="M7 4h6v6H7V4z" stroke="currentColor" strokeWidth="2" />
        <path
          d="M5 10h10v2c0 4-2.5 7-7 7H7c-1.1 0-2-.9-2-2v-7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8 19v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // fallback
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4v16M4 12h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActionDockButton({
  label,
  icon,
  onClick,
  tone = "neutral",
  disabled = false,
}) {
  const base =
    "group relative w-full rounded-2xl border px-4 py-3 sm:py-4 transition select-none";
  const disabledCls =
    "bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed";
  const neutral =
    "bg-black/35 border-white/10 text-zinc-100 hover:bg-black/45 hover:border-white/15";
  const primary =
    "bg-emerald-500/12 border-emerald-500/30 text-emerald-100 hover:bg-emerald-500/18 hover:border-emerald-400/40";
  const danger =
    "bg-rose-500/10 border-rose-500/25 text-rose-100 hover:bg-rose-500/14 hover:border-rose-400/35";

  const toneCls =
    tone === "primary" ? primary : tone === "danger" ? danger : neutral;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${disabled ? disabledCls : toneCls}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid place-items-center h-10 w-10 rounded-xl border ${disabled
            ? "border-white/10 bg-black/20"
            : "border-white/10 bg-black/30 group-hover:bg-black/35"
            }`}
        >
          <span className={disabled ? "text-zinc-500" : "text-emerald-200"}>
            <Icon name={icon} />
          </span>
        </div>
        <div className="text-left">
          <div className="text-sm sm:text-base font-extrabold leading-tight">
            {label}
          </div>
          <div className="text-[0.7rem] sm:text-xs text-zinc-400">
            Tap to act
          </div>
        </div>
      </div>
    </button>
=======
function useEventListener(target, eventName, handler, enabled = true, options) {
  React.useEffect(() => {
    if (!enabled) return;
    const t = typeof target === "function" ? target() : target;
    if (!t?.addEventListener) return;
    t.addEventListener(eventName, handler, options);
    return () => {
      try {
        t.removeEventListener(eventName, handler, options);
      } catch {
        // ignore
      }
    };
  }, [enabled, eventName, handler, options, target]);
}

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function CoachMarksOverlay({
  open,
  stepIndex,
  steps,
  reduceMotion,
  onBack,
  onNext,
  onSkipForever,
  onRemindLater,
}) {
  const step = steps?.[stepIndex] || null;
  const [rect, setRect] = React.useState(null);
  const primaryBtnRef = React.useRef(null);

  const updateRect = React.useCallback(() => {
    if (!open) return;
    const key = step?.targetKey;
    if (!key) {
      setRect(null);
      return;
    }

    // Prefer the first matching element in DOM. On mobile there will be one in the dock;
    // on desktop there will be one in the main action grid.
    const el = document.querySelector(`[data-coach="${key}"]`);
    if (!el) {
      setRect(null);
      return;
    }

    const r = el.getBoundingClientRect();
    // If element is effectively off-screen, don't draw a weird cutout.
    if (r.width < 4 || r.height < 4) {
      setRect(null);
      return;
    }

    setRect({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    });
  }, [open, step?.targetKey]);

  React.useEffect(() => {
    if (!open) return;
    // Let layout settle for a tick.
    const id = window.requestAnimationFrame(updateRect);
    return () => window.cancelAnimationFrame(id);
  }, [open, stepIndex, updateRect]);

  useEventListener(
    () => window,
    "resize",
    () => updateRect(),
    open,
  );
  useEventListener(
    () => window,
    "scroll",
    () => updateRect(),
    open,
    { passive: true }
  );

  // Keep keyboard focus in the tooltip while open (lightweight trap)
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => primaryBtnRef.current?.focus?.(), 0);
    return () => window.clearTimeout(t);
  }, [open, stepIndex]);

  useEventListener(
    () => window,
    "keydown",
    (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onRemindLater?.();
      }
    },
    open
  );

  if (!open || !step) return null;

  const padding = 10;
  const cutout = rect
    ? {
      left: rect.left - padding,
      top: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    }
    : null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  const tooltipWidth = clamp(Math.min(420, vw - 24), 260, 420);
  const tooltipSideMargin = 12;

  let tooltipLeft = Math.round((vw - tooltipWidth) / 2);
  let tooltipTop = Math.round(vh * 0.18);

  if (cutout) {
    const spaceBelow = vh - (cutout.top + cutout.height);
    const placeBelow = spaceBelow >= 190;
    tooltipTop = placeBelow
      ? Math.round(cutout.top + cutout.height + 12)
      : Math.round(Math.max(12, cutout.top - 12 - 170));

    const idealLeft = Math.round(cutout.left + cutout.width / 2 - tooltipWidth / 2);
    tooltipLeft = clamp(idealLeft, tooltipSideMargin, vw - tooltipWidth - tooltipSideMargin);
  }

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Scrim (blocks clicks everywhere) */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Spotlight cutout */}
      {cutout ? (
        <div
          className="absolute rounded-3xl"
          style={{
            left: cutout.left,
            top: cutout.top,
            width: cutout.width,
            height: cutout.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.70)",
            border: "1px solid rgba(52, 211, 153, 0.55)",
            background: "rgba(0,0,0,0.10)",
          }}
        />
      ) : null}

      {/* Clickable "ghost" action on top of the target so the scrim doesn't block it */}
      {cutout ? (
        <button
          type="button"
          onClick={step.onAction}
          aria-label={step.actionAriaLabel || step.actionLabel || step.title}
          className={
            "absolute rounded-3xl border border-emerald-400/70 bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80"
          }
          style={{
            left: cutout.left,
            top: cutout.top,
            width: cutout.width,
            height: cutout.height,
            cursor: "pointer",
          }}
        >
          <span className="sr-only">{step.actionLabel || step.title}</span>
          {!reduceMotion ? (
            <span
              aria-hidden
              className="absolute inset-0 rounded-3xl"
              style={{
                boxShadow: "0 0 0 0 rgba(16,185,129,0.0)",
                animation: "dg-coach-pulse 1.35s ease-in-out infinite",
              }}
            />
          ) : null}
        </button>
      ) : null}

      {/* Keyframes for the pulse */}
      <style>{`
        @keyframes dg-coach-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0); }
          45% { box-shadow: 0 0 0 10px rgba(16,185,129,0.14); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0); }
        }
      `}</style>

      {/* Tooltip */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Getting started"
        className="absolute rounded-3xl border border-white/15 bg-black/65 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.45)]"
        style={{
          width: tooltipWidth,
          left: tooltipLeft,
          top: tooltipTop,
          padding: 16,
        }}
      >
        <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
          First 60 seconds
        </div>
        <div className="mt-1 text-lg font-extrabold text-emerald-200">
          {step.title}
        </div>
        <div className="mt-1 text-sm text-zinc-200/90">{step.body}</div>

        {!rect ? (
          <div className="mt-2 text-xs text-amber-200/90">
            Tip: if you don’t see the highlighted button, scroll a little—then we’ll lock on.
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-xs text-zinc-400">
            Step {stepIndex + 1} of {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkipForever}
              className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={onRemindLater}
              className="rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            >
              Later
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={stepIndex === 0}
            className={
              stepIndex === 0
                ? "rounded-2xl px-4 py-2 text-sm font-extrabold bg-white/5 text-zinc-500 opacity-60 cursor-not-allowed"
                : "rounded-2xl px-4 py-2 text-sm font-extrabold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
            }
          >
            Back
          </button>

          <button
            ref={primaryBtnRef}
            type="button"
            onClick={onNext}
            className="rounded-2xl px-4 py-2 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_40px_rgba(16,185,129,0.22)] hover:bg-emerald-300 transition"
          >
            {stepIndex >= steps.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SetupOnboardingModal({
  open,
  name,
  steps,
  reduceMotion,
  onSaveName,
  onPickTemperament,
}) {
  const [localName, setLocalName] = React.useState(name || "Pup");

  React.useEffect(() => {
    if (!open) return;
    setLocalName(name || "Pup");
  }, [name, open]);

  if (!open) return null;

  const needName = !steps?.named;
  const stage = needName ? "name" : "done";

  return (
    <div className="fixed inset-0 z-[75]">
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative mx-auto grid min-h-dvh w-full max-w-xl place-items-center px-4">
        <div className="w-full overflow-hidden rounded-3xl border border-white/15 bg-black/55 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-300/90">
              Quick setup
            </div>
            <div className="mt-1 text-lg font-extrabold text-emerald-200">
              Let’s meet your pup
            </div>
            <div className="mt-1 text-sm text-zinc-200/90">
              One quick choice — then we’ll do the first actions together.
            </div>
          </div>

          {stage === "name" ? (
            <div className="px-5 py-5">
              <label className="text-xs font-semibold text-zinc-300">Dog name</label>
              <input
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                maxLength={18}
                placeholder="Pup"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
                autoFocus
              />
              <div className="mt-2 text-xs text-zinc-400">
                Tip: keep it short — it’ll show up in the HUD.
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-400 px-5 py-2.5 text-sm font-extrabold text-black shadow-[0_0_35px_rgba(52,211,153,0.25)]"
                  onClick={() => {
                    const cleaned = String(localName || "").trim();
                    const finalName = cleaned.length >= 2 ? cleaned : "Pup";
                    onSaveName?.(finalName);
                    if (!reduceMotion) {
                      try {
                        // Small confirmation pop via the toast system.
                      } catch {
                        // ignore
                      }
                    }
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {stage === "done" ? (
            <div className="px-5 py-5">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-extrabold text-white">Temperament develops over time</div>
                <div className="mt-1 text-xs text-zinc-300/90">
                  Over the next few real days, your pup’s temperament will form based on how you care for them
                  (play, training, consistency, and whether you leave them hungry/lonely).
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-400 px-5 py-2.5 text-sm font-extrabold text-black shadow-[0_0_35px_rgba(52,211,153,0.25)]"
                  onClick={() => {
                    // This modal will close automatically once setup state updates.
                    onPickTemperament?.(null);
                  }}
                >
                  Let’s go
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefers(Boolean(mq.matches));
    onChange();

    try {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } catch {
      // Safari < 14
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, []);

  return prefers;
}

function clamp01(n) {
  const x = Number(n ?? 0);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function moodLabelFromStats(stats) {
  const hunger = clamp01(stats?.hunger);
  const happiness = clamp01(stats?.happiness);
  const energy = clamp01(stats?.energy);
  const cleanliness = clamp01(stats?.cleanliness);

  if (energy <= 25) return "Sleepy";
  if (hunger >= 75) return "Hungry";
  if (cleanliness <= 25) return "Dirty";
  if (happiness >= 80) return "Hyped";
  if (happiness <= 35) return "Lonely";
  return "Content";
}

function weatherLabel(weather) {
  const w = String(weather || "unknown").toLowerCase();
  if (w === "unknown") return "Unknown";
  if (w === "rain") return "Rain";
  if (w === "snow") return "Snow";
  if (w === "cloud") return "Cloudy";
  if (w === "sun") {
    // "Sun" reads wrong at night; "Clear" is time-agnostic.
    return "Clear";
  }
  return "Unknown";
}

function YardOverlay({ isNight }) {
  // Simple CSS-only ambiance (no extra assets): stars at night, haze at day.
  // Keeps it subtle so it doesn't fight with the background art.
  if (!isNight) {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.18),transparent_55%)]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.10),transparent_65%)]" />
      <div className="absolute inset-0 opacity-60 mix-blend-screen">
        <div className="absolute left-[12%] top-[18%] h-1 w-1 rounded-full bg-white/80" />
        <div className="absolute left-[22%] top-[12%] h-1 w-1 rounded-full bg-white/60" />
        <div className="absolute left-[38%] top-[22%] h-1 w-1 rounded-full bg-white/70" />
        <div className="absolute left-[66%] top-[14%] h-1 w-1 rounded-full bg-white/70" />
        <div className="absolute left-[78%] top-[26%] h-1 w-1 rounded-full bg-white/60" />
        <div className="absolute left-[88%] top-[18%] h-1 w-1 rounded-full bg-white/75" />
      </div>
    </div>
  );
}

function AmbientLayers({
  isNight,
  bucket,
  reduceMotion,
  reduceTransparency,
}) {
  // Dawn/dusk grading overlay (works even if you don't ship dawn/dusk images yet)
  const bucketKey = String(bucket || "").toLowerCase();
  const isDawn = bucketKey === "dawn";
  const isDusk = bucketKey === "dusk";

  const gradingOpacity = reduceTransparency ? 0.25 : 0.45;
  const grading = isDawn
    ? "linear-gradient(180deg, rgba(253, 224, 71, 0.55) 0%, rgba(2,6,23,0) 45%, rgba(2,6,23,0.65) 100%)"
    : isDusk
      ? "linear-gradient(180deg, rgba(251, 146, 60, 0.48) 0%, rgba(15,23,42,0.15) 50%, rgba(2,6,23,0.75) 100%)"
      : null;

  const dur = reduceMotion ? "0ms" : "1400ms";

  // Fireflies (night)
  const fireflies = React.useMemo(
    () => [
      { x: 12, y: 58, s: 1.0, d: -0.3 },
      { x: 22, y: 72, s: 1.1, d: -1.2 },
      { x: 35, y: 62, s: 0.9, d: -2.1 },
      { x: 48, y: 70, s: 1.3, d: -0.8 },
      { x: 58, y: 60, s: 1.0, d: -1.7 },
      { x: 66, y: 76, s: 1.15, d: -2.8 },
      { x: 74, y: 66, s: 0.95, d: -3.4 },
      { x: 82, y: 72, s: 1.25, d: -1.9 },
      { x: 88, y: 60, s: 0.85, d: -2.6 },
    ],
    [],
  );

  return (
    <>
      {/* Keyframes (scoped-ish via dg- prefix). */}
      <style>{`
        @keyframes dg-cloud {
          0% { transform: translate3d(-15%, 0, 0); }
          100% { transform: translate3d(15%, 0, 0); }
        }
        @keyframes dg-fly {
          0% { transform: translate3d(0, 0, 0) scale(var(--dg-scale, 1)); opacity: 0.15; }
          35% { opacity: 0.85; }
          55% { transform: translate3d(12px, -10px, 0) scale(var(--dg-scale, 1)); opacity: 0.55; }
          100% { transform: translate3d(-10px, 8px, 0) scale(var(--dg-scale, 1)); opacity: 0.2; }
        }
        @keyframes dg-grass {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 220px 0, 120px 0; }
        }
      `}</style>

      {/* Dawn/dusk grading */}
      {grading ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: grading,
            opacity: gradingOpacity,
            transition: `opacity ${dur} ease`,
          }}
        />
      ) : null}

      {/* Day clouds */}
      {!isNight ? (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-12 left-0 right-0 h-44"
            style={{
              opacity: reduceTransparency ? 0.12 : 0.18,
              filter: reduceTransparency ? "none" : "blur(10px)",
              backgroundImage:
                "radial-gradient(circle at 20% 60%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(circle at 60% 40%, rgba(255,255,255,0.45), transparent 55%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.42), transparent 55%)",
              animation: reduceMotion ? "none" : "dg-cloud 28s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-6 left-0 right-0 h-40"
            style={{
              opacity: reduceTransparency ? 0.08 : 0.12,
              filter: reduceTransparency ? "none" : "blur(14px)",
              backgroundImage:
                "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.5), transparent 55%), radial-gradient(circle at 50% 30%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 78% 50%, rgba(255,255,255,0.4), transparent 55%)",
              animation: reduceMotion ? "none" : "dg-cloud 40s ease-in-out infinite alternate-reverse",
            }}
          />
        </div>
      ) : null}

      {/* Night fireflies */}
      {isNight ? (
        <div className="pointer-events-none absolute inset-0">
          {fireflies.map((f, idx) => (
            <div
              // deterministic coords: ok to use idx
              key={idx}
              className="absolute rounded-full"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: 3,
                height: 3,
                background: "rgba(253,230,138,0.95)",
                boxShadow: "0 0 18px rgba(253,230,138,0.40)",
                opacity: reduceTransparency ? 0.35 : 0.6,
                transform: "translate3d(0,0,0)",
                animation: reduceMotion ? "none" : `dg-fly 3.8s ease-in-out ${f.d}s infinite alternate`,
                // per-fly scale
                "--dg-scale": f.s,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* Foreground grass (subtle parallax-ish shimmer) */}
      <div
        className="pointer-events-none absolute left-0 right-0 bottom-0 h-36"
        style={{
          opacity: reduceTransparency ? 0.55 : 0.75,
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(2,6,23,0.55) 70%, rgba(2,6,23,0.85) 100%), repeating-linear-gradient(90deg, rgba(16,185,129,0.22) 0px, rgba(16,185,129,0.22) 2px, rgba(2,6,23,0) 6px, rgba(2,6,23,0) 10px), repeating-linear-gradient(90deg, rgba(34,197,94,0.12) 0px, rgba(34,197,94,0.12) 1px, rgba(2,6,23,0) 7px, rgba(2,6,23,0) 12px)",
          backgroundSize: "cover, 220px 100%, 120px 100%",
          backgroundPosition: "center, 0 0, 0 0",
          backgroundRepeat: "no-repeat, repeat-x, repeat-x",
          animation: reduceMotion ? "none" : "dg-grass 18s linear infinite",
        }}
      />
    </>
  );
}

function BackgroundCrossfade({ style, reduceMotion }) {
  const [a, setA] = React.useState(style);
  const [b, setB] = React.useState(null);
  const [showB, setShowB] = React.useState(false);

  const key = `${style?.backgroundImage}|${style?.backgroundPosition}|${style?.backgroundSize}|${style?.backgroundRepeat}`;
  const lastKeyRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (!style) return undefined;

    if (reduceMotion) {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setA(style);
      setB(null);
      setShowB(false);
      lastKeyRef.current = key;
      return undefined;
    }

    if (lastKeyRef.current === key) return undefined;
    lastKeyRef.current = key;

    setB(style);
    setShowB(true);

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setA(style);
      setB(null);
      setShowB(false);
    }, 750);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [key, reduceMotion, style]);

  const dur = reduceMotion ? "0ms" : "700ms";

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={a || undefined} />
      {b ? (
        <div
          className="absolute inset-0"
          style={{
            ...(b || {}),
            opacity: showB ? 1 : 0,
            transition: `opacity ${dur} ease`,
          }}
        />
      ) : null}
    </div>
>>>>>>> master
  );
}

export default function MainGame() {
  const dispatch = useDispatch();
<<<<<<< HEAD

  // Flexible selector so this doesn't explode if your store shape differs
  const dogState = useSelector(
    (s) => s?.dog?.current || s?.dog || s?.game?.dog || {},
  );
  const dog = dogState || {};
  const adopted = !!dog?.adoptedAt;
  const progression = dog?.progression;
  const polls = dog?.polls;
  const activePoll = polls?.active;

  const [pollCountdown, setPollCountdown] = useState(null);

  const timeOfDay = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return "MORNING";
    if (h >= 11 && h < 17) return "AFTERNOON";
    if (h >= 17 && h < 22) return "EVENING";
    return "NIGHT";
  }, []);

  const dogRenderMode = useSelector(selectDogRenderMode);
  const [realisticFailed, setRealisticFailed] = useState(false);
  const REALISTIC_SRC = "/assets/dogs/realistic/dog.svg";

  // Allow retrying the realistic image if the user toggles modes.
  useEffect(() => {
    setRealisticFailed(false);
    setHasWarnedMissingRealistic(false);
  }, [dogRenderMode]);

  // Canonical render model (single source of truth)
  const renderModel = selectDogRenderModel(dog);
  const stageLabel = renderModel.stageLabel;
  const spriteSrc = renderModel.staticSpriteUrl;

  // Stats
  const hunger = clamp01(dog?.stats?.hunger ?? 50);
  const happiness = clamp01(dog?.stats?.happiness ?? 60);
  const energy = clamp01(dog?.stats?.energy ?? 60);
  const cleanliness = clamp01(dog?.stats?.cleanliness ?? 60);

  // Mood hint
  const moodHint = (() => {
    if (energy <= 25) return "sleepy";
    if (hunger >= 75) return "hungry";
    if (cleanliness <= 25) return "dirty";
    if (happiness >= 78) return "happy";
    return "neutral";
  })();

  // Potty training lock
  const training = dog?.training || {};
  const potty = training?.potty || {};
  const goal = Number(potty?.goal || 0);
  const success = Number(potty?.successCount || 0);
  const pottyPercent =
    goal > 0
      ? Math.max(0, Math.min(100, Math.round((success / goal) * 100)))
      : 0;
  const pottyTrained = !!potty?.completedAt;

  // Long-term progression milestones
  const seasonLevel = Number(progression?.season?.level || 1);
  const journeyLevel = Number(progression?.journey?.level || 1);
  const weeklyChallenges = Array.isArray(progression?.weekly?.challenges)
    ? progression.weekly.challenges
    : [];
  const weeklyClaimedCount = weeklyChallenges.filter((c) => !!c?.claimedAt)
    .length;

  // UI feedback + animation pulse
  const [toast, setToast] = useState("");
  const [actionName, setActionName] = useState("");
  const [actionKey, setActionKey] = useState("");

  // UI-only burst effect (Lottie) on milestones
  const [fxOn, setFxOn] = useState(false);
  const [fxKey, setFxKey] = useState("");
  const fxTimerRef = useRef(null);
  const milestoneInitRef = useRef(false);
  const prevMilestonesRef = useRef({
    pottyTrained: false,
    pottyPercent: 0,
    seasonLevel: 1,
    journeyLevel: 1,
    weeklyClaimedCount: 0,
  });

  // Pixi renderer status (we mount Pixi even when hidden so it can load)
  const [pixiStatus, setPixiStatus] = useState("loading");

  // Responsive sizing for the dog stage so the Pixi canvas fits on mobile.
  const [dogView, setDogView] = useState({ w: 420, h: 300, scale: 2.6 });

  // One-time warning guard to avoid spamming when realistic image is missing.
  const [hasWarnedMissingRealistic, setHasWarnedMissingRealistic] =
    useState(false);

  function showToast(msg, ms = 1600) {
    const message = String(msg || "").trim();
    if (!message) return;

    setToast(message);
    window.clearTimeout(window.__doggerz_toast);
    window.__doggerz_toast = window.setTimeout(() => setToast(""), ms);
  }

  function pulse(action, msg) {
    if (msg) showToast(msg, 1600);
    if (action) {
      setActionName(action);
      setActionKey(`${action}:${Date.now()}`);
    }
  }

  function triggerFx(reason) {
    const key = `${String(reason || "fx")}:${Date.now()}`;
    setFxKey(key);
    setFxOn(true);
    window.clearTimeout(fxTimerRef.current);
    fxTimerRef.current = window.setTimeout(() => setFxOn(false), 900);
  }

  // Trigger the burst only for milestone moments (not every action click).
  useEffect(() => {
    const prev = prevMilestonesRef.current || {};

    // Avoid firing effects on initial load (e.g., returning users).
    if (!milestoneInitRef.current) {
      milestoneInitRef.current = true;
      prevMilestonesRef.current = {
        pottyTrained,
        pottyPercent,
        seasonLevel,
        journeyLevel,
        weeklyClaimedCount,
      };
      return;
    }

    // Potty completion is the biggest early-game milestone.
    if (!prev.pottyTrained && pottyTrained) {
      triggerFx("potty-trained");
    } else if (seasonLevel > Number(prev.seasonLevel || 1)) {
      triggerFx("season-level-up");
    } else if (journeyLevel > Number(prev.journeyLevel || 1)) {
      triggerFx("journey-level-up");
    } else if (weeklyClaimedCount > Number(prev.weeklyClaimedCount || 0)) {
      triggerFx("weekly-claimed");
    } else {
      // Potty progress thresholds: only celebrate meaningful checkpoints.
      // (0-24 none) (25/50/75/100) = celebrate
      const prevBucket = Math.floor(Number(prev.pottyPercent || 0) / 25);
      const nextBucket = Math.floor(Number(pottyPercent || 0) / 25);
      if (pottyPercent > Number(prev.pottyPercent || 0) && nextBucket > prevBucket) {
        // cap at 4 to avoid weirdness if % briefly exceeds 100
        const pct = Math.min(100, nextBucket * 25);
        if (pct >= 25) triggerFx(`potty-${pct}`);
      }
    }

    prevMilestonesRef.current = {
      pottyTrained,
      pottyPercent,
      seasonLevel,
      journeyLevel,
      weeklyClaimedCount,
    };
  }, [
    pottyTrained,
    pottyPercent,
    seasonLevel,
    journeyLevel,
    weeklyClaimedCount,
  ]);

  // Reset Pixi status when the dog render target changes.
  useEffect(() => {
    setPixiStatus("loading");
  }, [renderModel.stage, renderModel.condition]);

  // Keep the dog stage responsive (simple viewport heuristic).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const calc = () => {
      const maxW = 420;
      const minW = 280;
      // Account for page padding + card padding so the canvas doesn't overflow.
      const available = Math.max(0, (window.innerWidth || maxW) - 140);
      const w = Math.max(minW, Math.min(maxW, available));
      const h = Math.round((w * 300) / 420);
      const scale = 2.6 * (w / 420);
      setDogView({ w, h, scale });
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Allow other UI pieces (top bar) to trigger toasts.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (ev) => {
      const message = ev?.detail?.message;
      if (message) showToast(message, 1600);
    };

    window.addEventListener("doggerz:toast", handler);
    return () => window.removeEventListener("doggerz:toast", handler);
  }, []);

  function onFeed() {
    dispatch(feed({ now: Date.now() }));
    pulse("feed", "Fed.");
  }
  function onPlay() {
    dispatch(play({ now: Date.now() }));
    pulse("play", "Played.");
  }
  function onBathe() {
    dispatch(bathe({ now: Date.now() }));
    pulse("bathe", "Bathed.");
  }
  function onPotty() {
    dispatch(increasePottyLevel({ amount: 12 }));
    dispatch(goPotty({ now: Date.now() }));
    pulse("potty", "Potty break logged.");
  }
  function onTrain() {
    if (!pottyTrained) {
      pulse("", "Trick training locked until potty trained.");
      return;
    }
    dispatch(
      trainObedience({
        commandId: "sit",
=======
  const navigate = useNavigate();

  const dog = useSelector(selectDog);
  const stats = useSelector(selectDogStats);
  const lifeStage = useSelector(selectDogLifeStage);
  const training = useSelector(selectDogTraining);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);
  const xpProgress = useSelector(selectDogXpProgress);
  const streakInfo = useSelector(selectNextStreakReward);
  const weather = useSelector(selectWeatherCondition);
  const zip = useSelector(selectUserZip);
  const userCoins = useSelector(selectUserCoins);
  const settings = useSelector(selectSettings);

  const { playBark } = useYardSfx(settings);

  const prefersReducedMotion = usePrefersReducedMotion();
  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" && prefersReducedMotion);
  const batterySaver = Boolean(settings?.batterySaver);
  const reduceTransparency = Boolean(settings?.reduceTransparency);

  // Performance mode should reduce heavy FX without forcing reduced-motion accessibility.
  const perfMode = String(settings?.perfMode || 'auto').toLowerCase();
  const lowPowerHints = React.useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    // Best-effort heuristics; safe when properties are missing.
    const saveData = Boolean(navigator.connection?.saveData);
    const dm = Number(navigator.deviceMemory);
    const hc = Number(navigator.hardwareConcurrency);
    const lowMem = Number.isFinite(dm) && dm > 0 && dm <= 4;
    const lowCore = Number.isFinite(hc) && hc > 0 && hc <= 4;
    return Boolean(saveData || lowMem || lowCore);
  }, []);
  const perfFx =
    perfMode === 'on' ||
    (perfMode !== 'off' && (batterySaver || lowPowerHints));

  // IMPORTANT: Battery saver should reduce heavy FX, but it should NOT freeze the dog.
  // Respect actual reduced-motion preferences for accessibility.
  const reduceMotionEffective = Boolean(reduceMotion);
  const reduceMotionForFx = Boolean(reduceMotion || batterySaver || perfFx);
  const reduceTransparencyEffective = Boolean(reduceTransparency || batterySaver || perfFx);

  const { temperamentRevealReady, temperament } = useDogLifecycle();

  const adopted = Boolean(dog?.adoptedAt);
  const name = dog?.name || "Pup";
  const level = dog?.level || 1;
  const streakDays = Math.max(0, Math.floor(Number(dog?.streak?.currentStreakDays || 0)));
  const coins = Number.isFinite(Number(dog?.coins)) ? dog.coins : userCoins;

  const { isNight, style: yardStyle, timeOfDayBucket } = useDayNightBackground({
    zip,
  });

  const hunger = clamp01(stats?.hunger ?? 50);
  const happiness = clamp01(stats?.happiness ?? 60);
  const energy = clamp01(stats?.energy ?? 60);
  const cleanliness = clamp01(stats?.cleanliness ?? 60);

  const pottyComplete = Boolean(training?.potty?.completedAt);

  const spriteSrc = React.useMemo(() => {
    const stageId = lifeStage?.stage || "PUPPY";
    return getSpriteForStageAndTier(stageId, cleanlinessTier);
  }, [lifeStage?.stage, cleanlinessTier]);

  const moodLabel = moodLabelFromStats(stats);
  const weatherChip = weatherLabel(weather);

  const trainingInputMode =
    settings?.trainingInputMode || (settings?.voiceCommandsEnabled ? "both" : "buttons");
  const allowVoiceTraining = trainingInputMode === "voice" || trainingInputMode === "both";
  const allowButtonTraining = trainingInputMode === "buttons" || trainingInputMode === "both";

  const TRAINING_COMMANDS = React.useMemo(
    () => [
      { id: "sit", label: "Sit" },
      { id: "stay", label: "Stay" },
      { id: "rollOver", label: "Roll over" },
      { id: "speak", label: "Speak" },
    ],
    []
  );

  const [selectedCommandId, setSelectedCommandId] = React.useState("sit");
  const selectedCommandLabel =
    TRAINING_COMMANDS.find((c) => c.id === selectedCommandId)?.label || "Sit";

  const toast = useToast();

  const onLogout = React.useCallback(async () => {
    try {
      if (firebaseReady && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('[MainGame] signOut failed (continuing with local logout)', e);
    }

    dispatch(clearUser());
    toast.info('Signed out.', 1600);
    navigate('/login');
  }, [dispatch, navigate, toast]);

  const badges = React.useMemo(() => {
    return collectEarnedBadgeIds(dog);
  }, [dog]);

  const [hydrateError, setHydrateError] = React.useState(() => {
    try {
      return localStorage.getItem(HYDRATE_ERROR_KEY);
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    const syncHydrateError = () => {
      try {
        setHydrateError(localStorage.getItem(HYDRATE_ERROR_KEY));
      } catch {
        // ignore
      }
    };

    // DogAIEngine may set the key after the UI mounts.
    window.addEventListener("storage", syncHydrateError);
    window.addEventListener("focus", syncHydrateError);
    return () => {
      window.removeEventListener("storage", syncHydrateError);
      window.removeEventListener("focus", syncHydrateError);
    };
  }, []);

  const showHints = settings?.showHints !== false;
  const onboardingSteps = dog?.meta?.onboarding?.steps || {};
  const onboardingRewardedAt = dog?.meta?.onboarding?.rewardedAt;
  const onboardingDone = Boolean(
    onboardingSteps.named &&
    onboardingSteps.fed &&
    onboardingSteps.played
  );
  const needsSetup = Boolean(
    adopted && (!onboardingSteps.named)
  );

  const [onboardingDismissedForever, setOnboardingDismissedForever] = React.useState(
    () => {
      if (!showHints) return true;
      try {
        return localStorage.getItem(ONBOARDING_V2_KEY) === "1";
      } catch {
        return false;
      }
    }
  );

  const [onboardingSnoozed, setOnboardingSnoozed] = React.useState(false);
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);

  const [coachStepIndex, setCoachStepIndex] = React.useState(0);

  const [dogIntent, setDogIntent] = React.useState("idle");
  const dogIntentTimerRef = React.useRef(null);

  const dogIntentSeqTimerRef = React.useRef(null);

  const sleepAudioEnabled = Boolean(settings?.audio?.enabled) && (settings?.audio?.sleepEnabled !== false);
  const sleepAudioVolume = clamp(
    Number(settings?.audio?.masterVolume ?? 0.8) *
    Number(settings?.audio?.sfxVolume ?? 0.7) *
    Number(settings?.audio?.sleepVolume ?? 0.25),
    0,
    1
  );

  // Sleep ambience (best-effort; may require a user gesture depending on browser policy).
  useSleepAudio({
    active: (dog?.isAsleep) || dogIntent === 'sleep' || dogIntent === 'rest',
    enabled: sleepAudioEnabled,
    volume: sleepAudioVolume,
  });

  const bumpDogIntent = React.useCallback((next, ms = 1800) => {
    setDogIntent(next);
    if (dogIntentTimerRef.current) window.clearTimeout(dogIntentTimerRef.current);
    dogIntentTimerRef.current = window.setTimeout(() => setDogIntent("idle"), ms);
  }, []);

  const runDogIntentSequence = React.useCallback((steps) => {
    const seq = Array.isArray(steps) ? steps.filter(Boolean) : [];
    if (!seq.length) return;

    if (dogIntentSeqTimerRef.current) window.clearTimeout(dogIntentSeqTimerRef.current);
    if (dogIntentTimerRef.current) window.clearTimeout(dogIntentTimerRef.current);

    let i = 0;
    const tick = () => {
      const step = seq[i];
      const next = String(step?.intent || '').trim() || 'idle';
      const ms = Math.max(150, Number(step?.ms ?? 900) || 900);
      setDogIntent(next);
      i += 1;
      dogIntentSeqTimerRef.current = window.setTimeout(() => {
        if (i >= seq.length) {
          setDogIntent('idle');
          return;
        }
        tick();
      }, ms);
    };

    tick();
  }, []);

  const showToast = React.useCallback(
    (msg, ms = 1600) => {
      const message = String(msg || "").trim();
      if (!message) return;
      toast.info(message, ms);
    },
    [toast]
  );

  // Readable rewards: show why the player leveled up.
  const lastLevelUpAt = dog?.progress?.lastLevelUp?.at;
  const lastLevelUpSeenRef = React.useRef(null);
  React.useEffect(() => {
    if (!lastLevelUpAt) return;
    if (lastLevelUpSeenRef.current === lastLevelUpAt) return;
    lastLevelUpSeenRef.current = lastLevelUpAt;

    const toLevel = dog?.progress?.lastLevelUp?.toLevel;
    const reason = dog?.progress?.lastLevelUp?.reason;
    if (!toLevel) return;

    const why = reason ? ` (${String(reason).toLowerCase()})` : "";
    toast.reward(`Level up! Now level ${toLevel}${why}.`, 2400);
  }, [dog?.progress?.lastLevelUp?.reason, dog?.progress?.lastLevelUp?.toLevel, lastLevelUpAt, toast]);

  // Cosmetic unlocks (streak rewards)
  const lastUnlock = dog?.progress?.lastUnlock || null;
  const lastUnlockKey = lastUnlock?.id && lastUnlock?.at ? `${lastUnlock.id}:${lastUnlock.at}` : null;
  const lastUnlockSeenRef = React.useRef(null);
  React.useEffect(() => {
    if (!lastUnlockKey) return;
    if (lastUnlockSeenRef.current === lastUnlockKey) return;
    lastUnlockSeenRef.current = lastUnlockKey;

    const label = lastUnlock?.label || "New cosmetic";
    toast.reward(`Unlocked: ${label}!`, 2600);
  }, [lastUnlock?.label, lastUnlockKey, toast]);

  // Dev-only debug overlay
  const isDev = Boolean(import.meta?.env?.DEV);
  const [debugOpen, setDebugOpen] = React.useState(false);

  const showToastOncePer = React.useCallback(
    (key, msg, cooldownMs = 180_000, displayMs = 2000) => {
      toast.once(
        key,
        { type: "info", message: String(msg || "").trim(), durationMs: displayMs },
        cooldownMs
      );
    },
    [toast]
  );

  React.useEffect(() => {
    return () => {
      if (dogIntentTimerRef.current) window.clearTimeout(dogIntentTimerRef.current);
      if (dogIntentSeqTimerRef.current) window.clearTimeout(dogIntentSeqTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    // Compute whether coach marks should be visible.
    if (!showHints) {
      setOnboardingOpen(false);
      return;
    }
    if (!adopted) {
      setOnboardingOpen(false);
      return;
    }
    if (onboardingDismissedForever || onboardingSnoozed) {
      setOnboardingOpen(false);
      return;
    }
    if (needsSetup) {
      setOnboardingOpen(false);
      return;
    }
    if (onboardingDone) {
      setOnboardingOpen(false);
      return;
    }
    setOnboardingOpen(true);
  }, [adopted, needsSetup, onboardingDismissedForever, onboardingDone, onboardingSnoozed, showHints]);

  React.useEffect(() => {
    if (!onboardingOpen) return;
    // Auto-advance the coach steps as the user completes actions.
    if (!onboardingSteps.fed) {
      setCoachStepIndex(0);
      return;
    }
    if (!onboardingSteps.played) {
      setCoachStepIndex(1);
      return;
    }
  }, [onboardingOpen, onboardingSteps.fed, onboardingSteps.played]);

  // When the player completes the first actions, grant the starter reward once.
  React.useEffect(() => {
    if (!adopted) return;
    const readyForReward = Boolean(
      onboardingSteps.named &&
      onboardingSteps.fed &&
      onboardingSteps.played
    );
    if (!readyForReward) return;
    if (onboardingRewardedAt) return;

    dispatch(grantOnboardingReward({ now: Date.now() }));
    toast.reward("Starter reward: +50 coins, +18 XP.", 2600);

    // Also stop showing coach marks after success.
    try {
      localStorage.setItem(ONBOARDING_V2_KEY, "1");
    } catch {
      // ignore
    }
    setOnboardingDismissedForever(true);
    setOnboardingOpen(false);
  }, [
    adopted,
    dispatch,
    onboardingRewardedAt,
    onboardingSteps.fed,
    onboardingSteps.named,
    onboardingSteps.played,
    toast,
  ]);

  const onFeed = React.useCallback(() => {
    bumpDogIntent("eat", 2200);
    const now = Date.now();
    dispatch(feed({ now }));
    dispatch(setOnboardingStep({ step: 'fed', now }));
    showToast("Fed. Hunger down, happiness up.");
  }, [bumpDogIntent, dispatch, showToast]);

  const onPlay = React.useCallback(() => {
    void playBark({ throttleMs: 250 });
    runDogIntentSequence([
      { intent: 'bark', ms: 650 },
      { intent: 'fetch', ms: 2200 },
    ]);
    const now = Date.now();
    dispatch(play({ now, timeOfDay: String(timeOfDayBucket || "").toUpperCase() }));
    dispatch(setOnboardingStep({ step: 'played', now }));
    showToast("Playtime! Happiness up, energy down.");
  }, [dispatch, playBark, runDogIntentSequence, showToast, timeOfDayBucket]);

  const onDrink = React.useCallback(() => {
    bumpDogIntent("drink", 2200);
    showToast("Fresh water. Hydration time.", 1200);
  }, [bumpDogIntent, showToast]);

  const onBathe = React.useCallback(() => {
    runDogIntentSequence([
      { intent: 'shake', ms: 1200 },
      { intent: 'idle', ms: 300 },
    ]);
    dispatch(bathe({ now: Date.now() }));
    showToast("Bath complete. Fresh pup energy.");
  }, [dispatch, runDogIntentSequence, showToast]);

  const onPotty = React.useCallback(() => {
    bumpDogIntent('poop', 1400);
    dispatch(goPotty({ now: Date.now() }));
    showToast("Potty logged. Good pup.");
  }, [bumpDogIntent, dispatch, showToast]);

  const onTrain = React.useCallback(() => {
    if (!pottyComplete) {
      showToast("Trick training locks until potty training is complete.", 2200);
      return;
    }

    if (!allowButtonTraining) {
      showToast("Training is set to voice-only. Change it in Settings.", 2200);
      return;
    }

    const isSpeak = selectedCommandId === 'speak';
    if (isSpeak) void playBark({ throttleMs: 350 });
    bumpDogIntent(isSpeak ? 'bark' : 'train', 2000);
    dispatch(
      trainObedience({
        commandId: selectedCommandId,
>>>>>>> master
        success: true,
        xp: 6,
        now: Date.now(),
      }),
    );
<<<<<<< HEAD
    pulse("train", "Training session started.");
  }

  function performSuggestedAction(action) {
    const now = Date.now();
    if (action === "feed") {
      dispatch(feed({ now }));
      pulse("feed", "Fed.");
      return;
    }
    if (action === "play") {
      dispatch(play({ now, timeOfDay }));
      pulse("play", "Played.");
      return;
    }
    if (action === "bathe") {
      dispatch(bathe({ now }));
      pulse("bathe", "Bathed.");
      return;
    }
    if (action === "potty") {
      dispatch(goPotty({ now }));
      pulse("potty", "Potty time.");
      return;
    }
    if (action === "rest") {
      // In this UI, rest is represented by a simple toast/pulse.
      pulse("rest", "Rested.");
      return;
    }
    if (action === "train") {
      dispatch(
        trainObedience({
          commandId: "sit",
          success: true,
          xp: 6,
          now,
        }),
      );
      pulse("train", "Training session.");
    }
  }

  function onPollResponse(accepted) {
    const now = Date.now();
    dispatch(
      respondToDogPoll({
        accepted: !!accepted,
        reason: accepted ? "ACCEPT" : "DECLINE",
        now,
      }),
    );

    // If this poll included a suggested action, do it immediately.
    const suggested = activePoll?.action;
    if (accepted && suggested) {
      performSuggestedAction(suggested);
    } else if (!accepted) {
      showToast("Maybe later.", 900);
    }
  }

  // Poll countdown display
  useEffect(() => {
    if (!activePoll?.expiresAt) {
      setPollCountdown(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((activePoll.expiresAt - Date.now()) / 1000));
      setPollCountdown(left);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [activePoll?.expiresAt]);
  const wantsRealistic = dogRenderMode === "realistic";
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (!actionName) return;
    if (["feed", "play", "bathe", "potty", "train"].includes(actionName)) {
      setIsWalking(true);
      const id = window.setTimeout(() => setIsWalking(false), 1200);
      return () => window.clearTimeout(id);
    }
  }, [actionName]);

  // When realistic fails while requested, warn once.
  useEffect(() => {
    if (!wantsRealistic) return;
    if (!realisticFailed) return;
    if (hasWarnedMissingRealistic) return;
    setHasWarnedMissingRealistic(true);
    showToast("Realistic dog image missing — falling back to sprites", 2200);
  }, [wantsRealistic, realisticFailed, hasWarnedMissingRealistic]);

  if (!adopted) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.10)] p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-200">
            You don’t have a pup yet
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Adopt your first dog to start the yard experience, unlock potty
            training, and begin progression.
          </p>

=======
    showToast(`Training: practiced ‘${selectedCommandLabel}’.`, 1400);
  }, [
    allowButtonTraining,
    bumpDogIntent,
    dispatch,
    playBark,
    pottyComplete,
    selectedCommandId,
    selectedCommandLabel,
    showToast,
  ]);

  const onPet = React.useCallback(() => {
    // A gentle interaction (doesn't force sleep/wake).
    bumpDogIntent('wag', 1200);
    dispatch(pet({ now: Date.now() }));
    showToast('Pet. Tail wags.', 1200);
  }, [bumpDogIntent, dispatch, showToast]);

  const onRest = React.useCallback(() => {
    runDogIntentSequence([
      { intent: 'rest', ms: 1400 },
      { intent: 'sleep', ms: 4200 },
    ]);
    showToast(isNight ? 'Bedtime. Sweet dreams.' : 'Nap time. Recharge!', 1600);
  }, [isNight, runDogIntentSequence, showToast]);

  const coach = React.useMemo(() => {
    if (hunger >= 75) return "I’m starving. Food first.";
    if (energy <= 25) return "I’m sleepy. I’ll nap for a bit.";
    if (cleanliness <= 30) return "Bath time… I rolled in something legendary.";
    if (happiness <= 35) return "I need attention. Let’s play!";
    return "We’re doing great. Want to train a trick?";
  }, [hunger, energy, cleanliness, happiness]);

  const coachSteps = React.useMemo(() => {
    return [
      {
        targetKey: "feed",
        title: "Feed your pup",
        body: "Tap Feed to bring hunger down and start bonding. (You can’t really go wrong here.)",
        actionLabel: "Feed",
        onAction: onFeed,
      },
      {
        targetKey: "play",
        title: "Play time",
        body: "Tap Play to boost happiness. It costs some energy, but it’s worth it.",
        actionLabel: "Play",
        onAction: onPlay,
      },
    ];
  }, [onFeed, onPlay]);

  const dismissOnboardingForever = React.useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_V2_KEY, "1");
    } catch {
      // ignore
    }
    setOnboardingDismissedForever(true);
    setOnboardingOpen(false);
  }, []);

  // Gentle, rate-limited needs warnings (avoid spam)
  React.useEffect(() => {
    if (!adopted) return;

    if (hunger >= 92) {
      showToastOncePer("need:hunger", "I’m really hungry — feed me.", 240_000, 2200);
    }
    if (energy <= 15) {
      showToastOncePer("need:energy", "I’m exhausted — I need sleep.", 240_000, 2200);
    }
    if (cleanliness <= 18) {
      showToastOncePer(
        "need:clean",
        "I feel gross… bath time soon.",
        300_000,
        2200
      );
    }
    if (happiness <= 18) {
      showToastOncePer(
        "need:happiness",
        "I’m feeling ignored — let’s play.",
        300_000,
        2200
      );
    }
  }, [adopted, hunger, energy, cleanliness, happiness, showToastOncePer]);

  React.useEffect(() => {
    if (!adopted) return;
    if (settings?.dailyRemindersEnabled === false) return;
    const today = new Date().toISOString().slice(0, 10);
    const careDays = Array.isArray(dog?.meta?.careDays) ? dog.meta.careDays : [];
    if (careDays.includes(today)) return;

    toast.once(
      `daily:care:${today}`,
      {
        type: "info",
        message: "Daily routine reminder: feed, play, and log a potty break.",
        durationMs: 2600,
      },
      12 * 60 * 60 * 1000
    );
  }, [adopted, dog?.meta?.careDays, settings?.dailyRemindersEnabled, toast]);

  // Visual auto-sleep: when energy is critically low, show a sleeping pose immediately.
  // The actual Redux sleep flag flips on the next tick, but waiting up to 60s feels broken.
  React.useEffect(() => {
    if (!adopted) return;

    const asleep = dog?.isAsleep;
    if (asleep) return;

    const shouldLookAsleep = energy <= 15;

    // Don't interrupt other intents (eat/play/train). We'll apply once the dog returns to idle.
    if (shouldLookAsleep) {
      if (dogIntent !== "idle") return;

      // Cancel intent timers so we don't immediately snap back to idle.
      if (dogIntentTimerRef.current) {
        window.clearTimeout(dogIntentTimerRef.current);
        dogIntentTimerRef.current = null;
      }
      if (dogIntentSeqTimerRef.current) {
        window.clearTimeout(dogIntentSeqTimerRef.current);
        dogIntentSeqTimerRef.current = null;
      }

      setDogIntent("sleep");
      return;
    }

    // If we were visually sleeping but recovered (or got fed), go back to idle.
    if (dogIntent === "sleep") {
      setDogIntent("idle");
    }
  }, [adopted, dog?.isAsleep, dogIntent, energy]);

  if (!adopted) {
    return (
      <div className="min-h-dvh w-full grid place-items-center bg-zinc-950 text-white px-4">
        <div className="w-full max-w-lg rounded-3xl border border-emerald-500/20 bg-black/40 backdrop-blur p-6 shadow-[0_0_60px_rgba(16,185,129,0.14)]">
          <h1 className="text-2xl font-extrabold text-emerald-200">
            You don’t have a pup yet
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Adopt your first dog to enter the yard, unlock potty training, and start
            progression.
          </p>
>>>>>>> master
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.35)] hover:shadow-[0_0_45px_rgba(52,211,153,0.55)] transition"
            >
              Go to Adopt
            </Link>
<<<<<<< HEAD

=======
>>>>>>> master
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold border border-emerald-500/25 bg-black/30 text-emerald-100 hover:bg-black/45 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 pt-5">
      {/* GAME TOP BAR */}
      <div className="mb-4">
        <GameTopBar />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: DOG HERO */}
        <section className="lg:col-span-7 rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_70px_rgba(16,185,129,0.12)] overflow-hidden">
          {/* Header strip */}
          <div className="px-5 sm:px-6 py-4 border-b border-emerald-500/10 bg-black/25">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Backyard
                </div>
                <div className="text-lg sm:text-2xl font-extrabold text-emerald-200 leading-tight">
                  {dog?.name || "Pup"} <span className="text-zinc-500">•</span>{" "}
                  {stageLabel}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-zinc-300">
                  Mood:{" "}
                  <span className="text-emerald-200 font-semibold capitalize">
                    {moodHint}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400">Potty Training</div>
                <div className="text-sm font-extrabold text-emerald-200">
                  {pottyPercent}%
                </div>
              </div>
            </div>

            {toast ? (
              <div className="mt-3 text-sm font-semibold text-emerald-200">
                {toast}
              </div>
            ) : (
              <div className="mt-3 text-xs text-zinc-400">
                Care first. Potty training unlocks trick training.
              </div>
            )}
          </div>

          {/* Dog stage */}
          <div className="p-6 sm:p-8">
            {/* Depth + glow frame */}
            <div className="relative rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-10 overflow-hidden">
              {/* Soft vignette */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.10),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
              </div>

              {/* Dog platform */}
              <div className="relative flex items-center justify-center">
                <div className="absolute -bottom-6 h-16 w-72 rounded-[999px] bg-black/35 blur-xl" />
                <div className="absolute -bottom-6 h-10 w-56 rounded-[999px] bg-emerald-500/15 blur-xl" />

                {wantsRealistic && !realisticFailed ? (
                  <RealisticDog
                    stage={renderModel.stage}
                    src={REALISTIC_SRC}
                    size={420}
                    onLoadSuccess={() => setRealisticFailed(false)}
                    onLoadError={() => setRealisticFailed(true)}
                    className={isWalking ? "opacity-95" : ""}
                  />
                ) : (
                    <div
                      className="relative"
                      style={{ width: dogView.w, height: dogView.h }}
                    >
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${pixiStatus === "ready" ? "opacity-100" : "opacity-0"}`}
                      >
                        <DogPixiView
                          stage={renderModel.stage}
                          condition={renderModel.condition}
                          anim={renderModel.anim}
                          width={dogView.w}
                          height={dogView.h}
                          scale={dogView.scale}
                          onStatus={setPixiStatus}
                        />
                      </div>

                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${pixiStatus === "ready" ? "opacity-0" : "opacity-100"}`}
                      >
                        <AnimatedDog
                          src={spriteSrc}
                          cols={9}
                          rows={9}
                          fps={8}
                          scale={3.55 * (dogView.w / 420)}
                          pixelated={false}
                          mood={moodHint}
                          pulseKey={dog?.lastAction || ""}
                          action={actionName}
                          actionKey={actionKey}
                        />
                      </div>

                      {fxOn ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LottieBurst
                            playKey={fxKey}
                            animationData={pulseAnim}
                            size={Math.round(dogView.w * 1.05)}
                            className="opacity-90"
                            style={{ filter: "drop-shadow(0 0 28px rgba(52,211,153,0.25))" }}
                          />
                        </div>
                      ) : null}
                    </div>
                )}
              </div>            </div>

            {/* ACTION DOCK (replaces tiny button row) */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionDockButton label="Feed" icon="bowl" onClick={onFeed} />
              <ActionDockButton label="Play" icon="ball" onClick={onPlay} />
              <ActionDockButton
                label="Bathe"
                icon="sparkle"
                onClick={onBathe}
              />
              <ActionDockButton
                label="Potty Training"
                icon="toilet"
                onClick={onPotty}
                tone="primary"
              />
            </div>

            <div className="mt-3">
              <button
                disabled={!pottyTrained}
                className={`w-full rounded-2xl px-4 py-3 sm:py-4 text-sm sm:text-base font-extrabold transition
                  ${pottyTrained
                    ? "bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.35)] hover:shadow-[0_0_50px_rgba(52,211,153,0.60)]"
                    : "bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed"
                  }`}
                onClick={onTrain}
                type="button"
              >
                Trick Training
              </button>

              {!pottyTrained && (
                <div className="mt-2 text-xs text-zinc-400">
                  Trick training is locked until Potty Training reaches 100%.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: STICKY PANEL */}
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-4 space-y-4">
            {/* Care stats */}
            <section className="rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.08)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-emerald-500/10 bg-black/25">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Care
                </div>
                <div className="text-lg font-extrabold text-emerald-200">
                  Needs Overview
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  This is your dog’s current state.
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <StatRow label="Hunger" value={hunger} />
                <StatRow label="Happiness" value={happiness} />
                <StatRow label="Energy" value={energy} />
                <StatRow label="Cleanliness" value={cleanliness} />
              </div>
            </section>

            {/* Long-term progression */}
            <LongTermProgressionCard progression={progression} now={Date.now()} />

            {/* Dog polls (initiative) */}
            <DogPollCard
              activePoll={activePoll}
              pollCountdown={pollCountdown}
              onPollResponse={onPollResponse}
            />

            {/* Potty progress */}
            <section className="rounded-3xl border border-emerald-500/15 bg-black/35 backdrop-blur-md shadow-[0_0_60px_rgba(16,185,129,0.08)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-emerald-500/10 bg-black/25">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Progression
                </div>
                <div className="text-lg font-extrabold text-emerald-200">
                  Potty Training Tracker
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  Complete this milestone to unlock tricks.
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <PottyTrackerCard percent={pottyPercent} />
                <div className="mt-3 text-xs text-zinc-400">
                  {pottyTrained
                    ? "Potty training complete. Trick training is now unlocked."
                    : "Train consistently. When this hits 100%, tricks unlock permanently."}
                </div>
              </div>
            </section>
          </div>
        </aside>
=======
    <div className="min-h-dvh w-full text-white bg-zinc-950">
      <div className="relative min-h-dvh w-full">
        <BackgroundCrossfade style={yardStyle} reduceMotion={reduceMotionForFx} />

        <YardOverlay isNight={isNight} />
        <AmbientLayers
          isNight={isNight}
          bucket={timeOfDayBucket}
          reduceMotion={reduceMotionForFx}
          reduceTransparency={reduceTransparencyEffective}
        />

        {/* Weather particles: subtle rain/snow overlay */}
        <WeatherFXCanvas
          mode={perfFx ? 'none' : weather}
          reduceMotion={reduceMotionForFx}
          reduceTransparency={reduceTransparencyEffective}
        />

        {/* Darken for readability */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: reduceTransparencyEffective
              ? "rgba(0,0,0,0.45)"
              : "rgba(0,0,0,0.35)",
          }}
        />

        {/* Top HUD */}
        <div className="relative z-10">
          <GameTopBar
            dogName={name}
            level={level}
            xpPct={xpProgress?.pct ?? 0}
            xpLabel={xpProgress?.ready ? "Ready to level" : `${xpProgress?.current ?? 0}/${xpProgress?.needed ?? 0}`}
            coins={coins || 0}
            tokens={pottyComplete ? 1 : 0}
            badges={badges}
            onLogout={onLogout}
            lifeStageLabel={lifeStage?.label || "Puppy"}
            lifeStageDay={Number(lifeStage?.days || 0) + 1}
            moodLabel={moodLabel}
            streakDays={streakDays}
          />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pb-28 pt-6 sm:pt-8">
          <SetupOnboardingModal
            open={Boolean(needsSetup)}
            name={name}
            steps={onboardingSteps}
            reduceMotion={reduceMotionEffective}
            onSaveName={(nextName) => {
              const now = Date.now();
              dispatch(setDogName(nextName));
              dispatch(setOnboardingStep({ step: 'named', now }));
              toast.success(`Nice to meet you, ${nextName}.`, 1800);
            }}
          />

          <CoachMarksOverlay
            open={Boolean(onboardingOpen)}
            stepIndex={coachStepIndex}
            steps={coachSteps}
            reduceMotion={reduceMotionEffective}
            onBack={() => setCoachStepIndex((i) => Math.max(0, i - 1))}
            onNext={() =>
              setCoachStepIndex((i) =>
                i >= coachSteps.length - 1 ? i : i + 1
              )
            }
            onSkipForever={dismissOnboardingForever}
            onRemindLater={() => {
              setOnboardingSnoozed(true);
              setOnboardingOpen(false);
            }}
          />

          <DebugPanel
            open={isDev && debugOpen}
            onClose={() => setDebugOpen(false)}
            dog={dog}
            stats={stats}
            settings={settings}
            sprite={{
              stage: lifeStage?.stage,
              intent: dogIntent,
              commandId: selectedCommandId,
            }}
            env={{
              weather: weatherChip,
              timeOfDayBucket: String(timeOfDayBucket || "local").toUpperCase(),
              isNight,
              reduceMotion: reduceMotionEffective,
              reduceTransparency: reduceTransparencyEffective,
            }}
          />

          {/* Micro HUD row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {settings?.showGameMicroHud !== false ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs">
                  <span className="font-semibold text-emerald-200">Weather</span>
                  <span className="text-zinc-200/90">{weatherChip}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs">
                  <span className="font-semibold text-emerald-200">Time</span>
                  <span className="text-zinc-200/90">{String(timeOfDayBucket || "local").toUpperCase()}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs">
                  <span className="font-semibold text-emerald-200">Coach</span>
                  <span className="text-zinc-200/90">{coach}</span>
                </span>

                <span
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs"
                  title={
                    streakInfo?.next
                      ? `Next reward: ${streakInfo.next.label} at ${streakInfo.next.threshold} day(s).`
                      : undefined
                  }
                >
                  <span className="font-semibold text-emerald-200">Streak</span>
                  <span className="text-zinc-200/90">{Math.max(0, dog?.streak?.currentStreakDays || 0)}d</span>
                </span>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {isDev ? (
                <button
                  type="button"
                  onClick={() => setDebugOpen((v) => !v)}
                  className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                >
                  {debugOpen ? "Hide debug" : "Debug"}
                </button>
              ) : null}
            </div>
          </div>

          {hydrateError ? (
            <div className="mb-4 rounded-3xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-sm text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.14)]">
              <div className="font-extrabold">We had trouble loading your local save</div>
              <div className="mt-1 text-amber-100/90">
                Your save data on this device may be corrupted. You can reset locally, or restore from a backup in Settings.
              </div>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-amber-400 text-black font-extrabold"
                  onClick={() => {
                    const ok = window.confirm(
                      "Reset local save on this device? (Cloud data is not deleted.)"
                    );
                    if (!ok) return;
                    try {
                      localStorage.removeItem(DOG_STORAGE_KEY);
                      localStorage.removeItem(HYDRATE_ERROR_KEY);
                    } catch {
                      // ignore
                    }
                    dispatch(resetDogState());
                    setHydrateError(null);
                    toast.success("Local save reset.", 1600);
                  }}
                >
                  Reset local save
                </button>

                <Link
                  to="/settings"
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-amber-400/40 bg-black/25 text-amber-100 hover:bg-black/35 transition"
                >
                  Open Settings (restore)
                </Link>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                  onClick={() => {
                    try {
                      localStorage.removeItem(HYDRATE_ERROR_KEY);
                    } catch {
                      // ignore
                    }
                    setHydrateError(null);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* CENTER: Yard stage (big) */}
            <section className="lg:col-span-8 rounded-[2rem] border border-white/12 bg-black/20 backdrop-blur-md shadow-[0_0_100px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="relative">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.12),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0),rgba(0,0,0,0.55))]" />
                </div>

                <div className="relative h-[420px] sm:h-[520px] w-full">
                  {/* Make the yard visible inside the stage card (not only behind UI) */}
                  <div className="absolute inset-0">
                    {isNight ? (
                      <img
                        src={withBaseUrl("/backgrounds/backyard-night-wide.webp")}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                        style={{
                          filter: 'brightness(0.78) saturate(0.95) contrast(1.02)',
                        }}
                      />
                    ) : (
                      <>
                        {/*
                          The day background is portrait (768x1024) but the yard stage is landscape.
                          To make it feel "bigger" and more realistic, we:
                          1) Fill the wide stage with a blurred cover version (no harsh empty bars)
                          2) Overlay a sharp contain version so you can actually see the full yard
                        */}
                        <img
                          src={withBaseUrl("/backgrounds/backyard-day-wide.webp")}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            objectPosition: '50% 82%',
                            filter: 'brightness(1.05) saturate(1.05) contrast(1.03)',
                          }}
                        />
                      </>
                    )}
                    {/* Light-grade overlays so day/night feel like the same yard */}
                    {isNight ? (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(110,200,255,0.14),transparent_55%)]" />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,214,140,0.26),transparent_55%)]" />
                    )}
                    <div className={isNight ? "absolute inset-0 bg-black/30" : "absolute inset-0 bg-black/5"} />
                  </div>

                  {/* Props / set dressing (covers pool, adds dog house + bowl, adds door/light) */}
                  <YardSetDressing
                    isNight={isNight}
                    onBowl={onFeed}
                    onWaterBowl={onDrink}
                    onBall={onPlay}
                    onDogHouse={onRest}
                  />

                  <YardDogActor
                    spriteSrc={spriteSrc}
                    lifeStageStage={lifeStage?.stage}
                    size={360}
                    reduceMotion={reduceMotionEffective}
                    reduceTransparency={reduceTransparencyEffective}
                    isNight={isNight}
                    isAsleep={dog?.isAsleep}
                    critterEnabled={(settings?.showCritters !== false) && !(settings?.batterySaver) && !perfFx}
                    roamIntensity={Number(settings?.roamIntensity ?? 1) * (perfFx ? 0.45 : 1)}
                    intent={dogIntent}
                    commandId={selectedCommandId}
                    cosmeticsEquipped={dog?.cosmetics?.equipped}
                    onPet={onPet}
                  />
                </div>
              </div>
            </section>

            {/* RIGHT: HUD stack */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-4 space-y-4">
                <NeedsHUD />
                <MoodAndJournalPanel />
                <TrainingPanel
                  pottyComplete={pottyComplete}
                  trainingInputMode={trainingInputMode}
                  allowButtonTraining={allowButtonTraining}
                  allowVoiceTraining={allowVoiceTraining}
                  commands={TRAINING_COMMANDS}
                  selectedCommandId={selectedCommandId}
                  onSelectCommand={(id) => setSelectedCommandId(id)}
                />
              </div>
            </aside>
          </div>

        </main>

        {/* Sticky action dock (quick taps) */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 pb-3">
            <div className="rounded-2xl border border-white/15 bg-black/45 backdrop-blur-md shadow-lg shadow-black/25">
              <div className="flex gap-2 p-2 sm:p-3 overflow-x-auto">
                <button
                  type="button"
                  onClick={onFeed}
                  data-coach="feed"
                  className={`min-w-[72px] sm:min-w-[92px] rounded-xl px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95 ${onboardingOpen && !onboardingSteps.fed
                    ? "bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/60"
                    : "bg-emerald-500/15 text-emerald-100"
                    }`}
                >
                  Feed
                </button>
                  <button
                    type="button"
                    onClick={onPlay}
                    data-coach="play"
                  className={`min-w-[72px] sm:min-w-[92px] rounded-xl px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95 ${onboardingOpen && onboardingSteps.fed && !onboardingSteps.played
                    ? "bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/60"
                    : "bg-sky-500/15 text-sky-100"
                    }`}
                >
                    Play
                  </button>

                  <button
                    type="button"
                    onClick={onDrink}
                    className="min-w-[72px] sm:min-w-[92px] rounded-xl bg-cyan-500/15 text-cyan-100 px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95"
                  >
                    Drink
                  </button>

                  <button
                    type="button"
                    onClick={onPet}
                  className="min-w-[72px] sm:min-w-[92px] rounded-xl bg-emerald-500/10 text-emerald-100 px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95"
                >
                  Pet
                </button>

                <button
                  type="button"
                  onClick={onPotty}
                  data-coach="potty"
                  className="min-w-[72px] sm:min-w-[92px] rounded-xl bg-amber-500/15 text-amber-100 px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95"
                >
                  Potty
                </button>
                <button
                  type="button"
                  onClick={onBathe}
                  className="min-w-[72px] sm:min-w-[92px] rounded-xl bg-indigo-500/15 text-indigo-100 px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95"
                >
                  Bath
                </button>

                <button
                  type="button"
                  onClick={onTrain}
                  disabled={!pottyComplete}
                  className={`min-w-[72px] sm:min-w-[92px] rounded-xl px-2 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold transition active:scale-95 ${pottyComplete
                    ? "bg-violet-500/15 text-violet-100"
                    : "bg-white/5 text-zinc-500 opacity-60 cursor-not-allowed"
                    }`}
                >
                  Train
                </button>

                {/* spacer so last button isn't flush against scrollbar */}
                <span className="w-1 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Temperament reveal overlay */}
        {temperamentRevealReady && temperament && !temperament?.revealedAt ? (
          <TemperamentCard temperament={temperament} />
        ) : null}
>>>>>>> master
      </div>
    </div>
  );
}
