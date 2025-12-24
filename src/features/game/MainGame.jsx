// src/features/game/MainGame.jsx
// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import GameTopBar from "@/features/game/components/GameTopBar.jsx";
import AnimatedDog from "@/components/AnimatedDog.jsx";
import RealisticDog from "@/components/RealisticDog.jsx";
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
      </div>
    </div>
  );
}

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
  );
}

export default function MainGame() {
  const dispatch = useDispatch();

  // Flexible selector so this doesn't explode if your store shape differs
  const dogState = useSelector(
    (s) => s?.dog?.current || s?.dog || s?.game?.dog || {},
  );
  const dog = dogState || {};
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

  // UI feedback + animation pulse
  const [toast, setToast] = useState("");
  const [actionName, setActionName] = useState("");
  const [actionKey, setActionKey] = useState("");

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
    pulse("potty", "Potty training progress.");
  }
  function onTrain() {
    if (!pottyTrained) {
      pulse("", "Trick training locked until potty trained.");
      return;
    }
    dispatch(
      trainObedience({
        commandId: "sit",
        success: true,
        xp: 6,
        now: Date.now(),
      }),
    );
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

  return (
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
                  <AnimatedDog
                    src={spriteSrc}
                    cols={9}
                    rows={9}
                    fps={8}
                    scale={3.55}
                    pixelated={false}
                    mood={moodHint}
                    pulseKey={dog?.lastAction || ""}
                    action={actionName}
                    actionKey={actionKey}
                  />
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
      </div>
    </div>
  );
}
