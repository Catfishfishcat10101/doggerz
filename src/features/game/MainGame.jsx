// src/features/game/MainGame.jsx
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

// MainGame renders the single scene card experience: a wide left scene with the
// dog viewport and action dock, paired with a slim right rail containing stats,
// polls, potty tracking, and progression modules. Keep bindings intact while
// adjusting layout/styling here.
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

  const trainingButtonEnabled =
    "bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.35)] hover:shadow-[0_0_50px_rgba(52,211,153,0.60)]";
  const trainingButtonDisabled =
    "bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed";

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

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.35)] hover:shadow-[0_0_45px_rgba(52,211,153,0.55)] transition"
            >
              Go to Adopt
            </Link>

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
    <div className="w-full max-w-7xl mx-auto px-4 pb-14 pt-5">
      <div className="mb-4">
        <GameTopBar />
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-black/60 to-black shadow-[0_0_90px_rgba(16,185,129,0.18)]">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-32 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.20),transparent_40%)]" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.6fr]">
          <div className="relative p-6 sm:p-8 lg:p-10 space-y-6 border-b border-white/5 lg:border-b-0 lg:border-r lg:border-white/5 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-300/80">
                  Backyard Scene
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-100 leading-tight">
                  {dog?.name || "Pup"} <span className="text-zinc-500">•</span> {stageLabel}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-zinc-200">
                  Mood: <span className="text-emerald-200 font-semibold capitalize">{moodHint}</span>
                </div>

                {toast ? (
                  <div className="mt-3 text-sm font-semibold text-emerald-200">
                    {toast}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-zinc-300/80">
                    Care first. Potty training unlocks trick training.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-3 py-2">
                <div className="text-xs text-zinc-400">Potty training</div>
                <div className="text-lg font-extrabold text-emerald-200">{pottyPercent}%</div>
              </div>
            </div>

            <div className="relative rounded-[28px] border border-white/10 bg-black/40 p-5 sm:p-8 shadow-inner overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.4),transparent)]" />
              </div>

              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-center">
                <div className="relative mx-auto" style={{ width: dogView.w, height: dogView.h }}>
                  <div className={`absolute inset-0 transition-opacity duration-300 ${pixiStatus === "ready" ? "opacity-100" : "opacity-0"}`}>
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
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                      pixiStatus === "ready" ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    {wantsRealistic && !realisticFailed ? (
                      <RealisticDog
                        stage={renderModel.stage}
                        src={REALISTIC_SRC}
                        size={dogView.w}
                        onLoadSuccess={() => setRealisticFailed(false)}
                        onLoadError={() => setRealisticFailed(true)}
                        className={isWalking ? "opacity-95" : ""}
                      />
                    ) : (
                      <AnimatedDog
                        src={spriteSrc}
                        cols={9}
                        rows={3}
                        frameDelay={80}
                        className="w-full max-w-[420px]"
                      />
                    )}
                  </div>

                  {fxOn ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LottieBurst
                        playKey={fxKey}
                        animationData={pulseAnim}
                        size={Math.round(dogView.w * 1.05)}
                        className="opacity-90"
                        style={{
                          filter: "drop-shadow(0 0 28px rgba(52,211,153,0.25))",
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionDockButton label="Feed" icon="bowl" onClick={onFeed} />
              <ActionDockButton label="Play" icon="ball" onClick={onPlay} />
              <ActionDockButton label="Bathe" icon="sparkle" onClick={onBathe} />
              <ActionDockButton
                label="Potty Training"
                icon="toilet"
                onClick={onPotty}
                tone="primary"
              />
            </div>

            <div>
              <button
                disabled={!pottyTrained}
                className={`w-full rounded-2xl px-4 py-3 sm:py-4 text-sm sm:text-base font-extrabold transition ${
                  pottyTrained
                    ? trainingButtonEnabled
                    : trainingButtonDisabled
                }`}
                onClick={onTrain}
                type="button"
              >
                Trick Training
              </button>

              {!pottyTrained && (
                <div className="mt-2 text-xs text-zinc-300/80">
                  Trick training is locked until Potty Training reaches 100%.
                </div>
              )}
            </div>
          </div>

          <aside className="relative bg-black/30 backdrop-blur-sm p-5 sm:p-7 space-y-4">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-300/80">
                    Care
                  </div>
                  <div className="text-lg font-extrabold text-emerald-200">Needs</div>
                </div>
                <div className="text-xs text-zinc-400">Live pulse</div>
              </div>
              <div className="space-y-3">
                <StatRow label="Hunger" value={hunger} />
                <StatRow label="Happiness" value={happiness} />
                <StatRow label="Energy" value={energy} />
                <StatRow label="Cleanliness" value={cleanliness} />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-black/45 p-4 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/80">Polls</div>
                  <div className="text-sm font-semibold text-emerald-50">Dog choices</div>
                </div>
                <div className="text-xs text-emerald-200/80">
                  {typeof pollCountdown === "number" ? `${pollCountdown}s` : ""}
                </div>
              </div>
              <DogPollCard
                activePoll={activePoll}
                pollCountdown={pollCountdown}
                onPollResponse={onPollResponse}
              />
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/80">
                    Potty Training
                  </div>
                  <div className="text-sm font-semibold text-emerald-50">Tracker</div>
                </div>
                <div className="text-xs text-emerald-200">{pottyTrained ? "Complete" : `${pottyPercent}%`}</div>
              </div>
              <PottyTrackerCard percent={pottyPercent} />
              <div className="text-[0.75rem] text-zinc-300/90">
                {pottyTrained
                  ? "Potty training complete. Trick training is now unlocked."
                  : "Train consistently. When this hits 100%, tricks unlock permanently."}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-200/80">Progression</div>
                  <div className="text-sm font-semibold text-emerald-50">Long term</div>
                </div>
                <div className="text-[0.7rem] text-emerald-200/80">Season &amp; journey</div>
              </div>
              <LongTermProgressionCard progression={progression} now={Date.now()} />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

