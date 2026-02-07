/** @format */
// src/features/game/DogStage.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import SpriteSheetDog from "@/components/SpriteSheetDog.jsx";
import PuppyPassport from "@/components/PuppyPassport.jsx";
import RealisticDog from "@/components/RealisticDog.jsx";
import { selectDogRenderParams } from "@/features/dog/dogSelectors.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { selectDogRenderMode } from "@/redux/userSlice.js";
import { triggerManualAction } from "@/redux/dogSlice.js";
import { getCheckInTier, resolveConditionPrefix } from "@/utils/checkIn.js";
import { useDogActionSfx } from "@/features/audio/useDogActionSfx.js";

const TURN_DURATION_MS = 320;
const STOP_EPSILON = 6;
const PASSPORT_STORAGE_KEY_BASE = "doggerz:passportOpen";
const AUTO_DECISION_MS = 5000;
const AUTO_WALK_MS = 3000;
const AUTO_SIT_MS = 5000;
const AUTO_SLEEP_ENERGY = 10;
const AUTO_IDLE_CHANCE = 0.6;
const AUTO_WAG_CHANCE = 0.2;
const AUTO_WALK_CHANCE = 0.15;
const TAP_PET_DISTANCE = 60;
const COMMAND_DURATION_MS = 1800;
const COMMAND_ANIMS = new Set([
  "front_flip",
  "jump",
  "eat",
  "trick",
  "sit",
  "laydown",
  "shake",
  "beg",
  "rollover",
  "roll",
  "roll_over",
  "playdead",
  "play_dead",
  "bark",
  "scratch",
  "spin",
  "paw",
  "bow",
  "highfive",
  "high_five",
  "wave",
  "fetch",
  "dance",
  "stay",
]);
const COMMAND_DURATIONS = Object.freeze({
  front_flip: 2400,
  jump: 1800,
  eat: 2000,
  bark: 1200,
  scratch: 1400,
  sit: 1800,
  laydown: 2000,
  beg: 1800,
  shake: 1600,
  rollover: 2200,
  roll: 2200,
  roll_over: 2200,
  playdead: 2400,
  play_dead: 2400,
  spin: 1600,
  paw: 1400,
  bow: 1600,
  highfive: 1600,
  high_five: 1600,
  wave: 1600,
  fetch: 2000,
  dance: 2000,
  stay: 1600,
  trick: 1800,
});

const normalizeAnimKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

const ALLOW_DEBUG =
  (typeof import.meta !== "undefined" && import.meta?.env?.DEV) ||
  (typeof import.meta !== "undefined" &&
    import.meta?.env?.VITE_ENABLE_DEBUG === "true");

const getIsDesktop = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(min-width: 1024px)").matches;
  } catch {
    return false;
  }
};

const getPassportStorageKey = (isDesktop) =>
  `${PASSPORT_STORAGE_KEY_BASE}:${isDesktop ? "desktop" : "mobile"}`;

export default function DogStage({ dog, scene, targetX = null }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const renderMode = useSelector(selectDogRenderMode);
  const frameLabel = dog?.lifeStage?.label || "Puppy";
  const [appHidden, setAppHidden] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  const reduceMotionSetting = settings?.reduceMotion || "system";
  const prefersReducedMotion = useMemo(() => {
    try {
      return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }, []);

  const reduceMotion =
    reduceMotionSetting === "on" ||
    (reduceMotionSetting !== "off" && prefersReducedMotion) ||
    appHidden ||
    lowPower;

  const renderParams = useMemo(() => {
    if (dog && typeof dog === "object") return selectDogRenderParams(dog);
    return selectDogRenderParams({ stage: "PUPPY" });
  }, [dog]);
  const debugEnabled = ALLOW_DEBUG;
  const size =
    renderParams.stage === "adult"
      ? 360
      : renderParams.stage === "senior"
        ? 340
        : 320;

  const stageRef = useRef(null);
  const [stageWidth, setStageWidth] = useState(520);
  const [posX, setPosX] = useState(0);
  const [movementAnim, setMovementAnim] = useState(null);
  const [facing, setFacing] = useState(1);
  const [turnFacing, setTurnFacing] = useState(1);
  const [animDebug, setAnimDebug] = useState(null);
  const [commandAnim, setCommandAnim] = useState(null);
  const [autoAnim, setAutoAnim] = useState("idle");
  const [userMoveActive, setUserMoveActive] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugAnimOverride, setDebugAnimOverride] = useState(null);
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const [passportOpen, setPassportOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(
        getPassportStorageKey(getIsDesktop())
      );
      if (raw == null) return false;
      return raw === "true";
    } catch {
      return false;
    }
  });
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const facingRef = useRef(1);
  const turningRef = useRef(false);
  const turnTimerRef = useRef(null);
  const commandTimeoutRef = useRef(null);
  const autoTimeoutRef = useRef(null);
  const autoIntervalRef = useRef(null);
  const lastCommandKeyRef = useRef(null);
  const userTargetRef = useRef(null);
  const debugTapRef = useRef({ count: 0, last: 0, first: 0 });

  const baseAnimHint =
    ALLOW_DEBUG && debugAnimOverride ? debugAnimOverride : renderParams.anim;
  const energy = Number(dog?.stats?.energy ?? 0);
  const sleepLocked =
    Boolean(dog?.isAsleep) || baseAnimHint === "sleep" || energy <= 0;

  const commandCandidate = useMemo(() => {
    const key = normalizeAnimKey(baseAnimHint);
    return COMMAND_ANIMS.has(key) ? key : null;
  }, [baseAnimHint]);

  const autoBaseAnim = useMemo(() => {
    const key = normalizeAnimKey(baseAnimHint);
    if (key === "walk_left" || key === "walk_right") return "walk";
    if (key === "walk" || key === "idle" || key === "wag") return key;
    return "idle";
  }, [baseAnimHint]);

  const baseAnim = commandAnim || (sleepLocked ? "sleep" : autoAnim);
  const explicitAnim =
    baseAnim === "walk_left" ||
    baseAnim === "walk_right" ||
    baseAnim === "turn_walk_right";
  const allowMovementAnim = baseAnim === "walk";

  const displayAnim =
    commandAnim || baseAnim === "sleep"
      ? baseAnim
      : explicitAnim
        ? baseAnim
        : allowMovementAnim
          ? movementAnim || baseAnim
          : baseAnim;
  const turningAnim = displayAnim === "turn_walk_right";
  const displayFacing = explicitAnim
    ? baseAnim === "walk_left"
      ? -1
      : 1
    : turningAnim
      ? turnFacing
      : facing;

  const handleDebugTap = useCallback(() => {
    if (!debugEnabled) return;
    const now = Date.now();
    const tapState = debugTapRef.current || { count: 0, last: 0, first: 0 };

    if (now - tapState.last < 500) {
      tapState.count += 1;
    } else {
      tapState.count = 1;
      tapState.first = now;
    }
    tapState.last = now;

    if (tapState.count >= 5 && now - tapState.first <= 2000) {
      tapState.count = 0;
      tapState.first = 0;
      setDebugOpen(true);
    }

    debugTapRef.current = tapState;
  }, [debugEnabled]);

  const checkIn = useMemo(() => {
    const lastSeenAt =
      dog?.memory?.lastSeenAt || dog?.memory?.lastSeen || dog?.lastUpdatedAt;
    return getCheckInTier(lastSeenAt);
  }, [dog?.lastUpdatedAt, dog?.memory?.lastSeen, dog?.memory?.lastSeenAt]);

  const conditionAnim = useMemo(() => {
    if (explicitAnim) return displayAnim;
    if (displayAnim === "turn_walk_right") return displayAnim;
    const prefix = resolveConditionPrefix(checkIn?.tier);
    if (!prefix) return displayAnim;

    if (
      displayAnim === "walk" ||
      displayAnim === "walk_left" ||
      displayAnim === "walk_right"
    ) {
      return `${prefix}walk`;
    }
    if (displayAnim === "scratch") return `${prefix}scratch`;
    if (displayAnim === "sleep") return `${prefix}sleep`;
    if (displayAnim === "idle" || displayAnim === "wag") return `${prefix}idle`;
    return displayAnim;
  }, [checkIn?.tier, displayAnim, explicitAnim]);

  const realisticAnim = useMemo(() => {
    if (!conditionAnim) return conditionAnim;
    return String(conditionAnim || "")
      .replace(/^stray_/, "")
      .replace(/^tired_/, "");
  }, [conditionAnim]);

  useDogActionSfx({
    anim: animDebug?.activeAnim || conditionAnim,
    frameIndex:
      animDebug?.activeFrameIndex != null
        ? animDebug.activeFrameIndex
        : animDebug?.frame,
    frameCount:
      animDebug?.activeFrames != null
        ? animDebug.activeFrames
        : animDebug?.frames,
    energy,
    tier: checkIn?.tier,
    audio: settings?.audio,
    hapticsEnabled: settings?.hapticsEnabled,
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => {
      const next = Math.max(280, Math.round(el.clientWidth || 0));
      setStageWidth(next);
    };
    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    setTurnFacing(facing);
  }, [facing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event) => setIsDesktop(event.matches);

    try {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    } catch {
      media.addListener(handleChange);
      return () => media.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(getPassportStorageKey(isDesktop));
      if (raw == null) return;
      setPassportOpen(raw === "true");
    } catch {
      // ignore storage errors
    }
  }, [isDesktop]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibility = () => {
      setAppHidden(Boolean(document.hidden));
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.getBattery) return;
    let batteryRef = null;
    let cancelled = false;

    const update = () => {
      if (cancelled || !batteryRef) return;
      const level = Number(batteryRef.level || 0);
      const isLow = Number.isFinite(level) && level > 0 && level <= 0.15;
      setLowPower(isLow);
    };

    navigator
      .getBattery()
      .then((battery) => {
        if (cancelled) return;
        batteryRef = battery;
        update();
        battery.addEventListener("levelchange", update);
        battery.addEventListener("chargingchange", update);
      })
      .catch(() => {
        // ignore battery API errors
      });

    return () => {
      cancelled = true;
      if (batteryRef) {
        batteryRef.removeEventListener("levelchange", update);
        batteryRef.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        getPassportStorageKey(isDesktop),
        passportOpen ? "true" : "false"
      );
    } catch {
      // ignore storage errors
    }
  }, [isDesktop, passportOpen]);

  useEffect(() => {
    if (!reduceMotion) return;
    posRef.current = 0;
    setPosX(0);
  }, [reduceMotion]);

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) {
        window.clearTimeout(turnTimerRef.current);
        turnTimerRef.current = null;
      }
      if (commandTimeoutRef.current) {
        window.clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
      if (autoTimeoutRef.current) {
        window.clearTimeout(autoTimeoutRef.current);
        autoTimeoutRef.current = null;
      }
      if (autoIntervalRef.current) {
        window.clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!commandCandidate || sleepLocked) return;
    const commandKey = [
      commandCandidate,
      dog?.lastAction || "",
      dog?.memory?.lastTrainedCommandId || "",
      dog?.memory?.lastSeenAt || "",
    ].join("|");
    if (lastCommandKeyRef.current === commandKey) return;
    lastCommandKeyRef.current = commandKey;
    const duration = COMMAND_DURATIONS[commandCandidate] || COMMAND_DURATION_MS;
    setCommandAnim(commandCandidate);
    setUserMoveActive(false);
    if (commandTimeoutRef.current) {
      window.clearTimeout(commandTimeoutRef.current);
    }
    commandTimeoutRef.current = window.setTimeout(() => {
      setCommandAnim(null);
    }, duration);
  }, [
    commandCandidate,
    dog?.lastAction,
    dog?.memory?.lastSeenAt,
    dog?.memory?.lastTrainedCommandId,
    sleepLocked,
  ]);

  useEffect(() => {
    if (!sleepLocked) return;
    setCommandAnim(null);
    setUserMoveActive(false);
    if (commandTimeoutRef.current) {
      window.clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
  }, [sleepLocked]);

  useEffect(() => {
    if (!lowPower) return;
    if (commandAnim) return;
    setUserMoveActive(false);
    setAutoAnim("sleep");
    setMovementAnim(null);
  }, [commandAnim, lowPower]);

  const handleDebugAnim = useCallback(
    (anim) => {
      if (!debugEnabled) return;
      const key = String(anim || "").trim();
      setDebugAnimOverride(key || null);
      setCommandAnim(null);
      setUserMoveActive(false);
      if (!key) return;
      setAutoAnim(key === "walk" ? "walk" : key);
    },
    [debugEnabled]
  );

  const clearDebugAnim = useCallback(() => {
    if (!debugEnabled) return;
    setDebugAnimOverride(null);
    setCommandAnim(null);
    setUserMoveActive(false);
    setAutoAnim("idle");
  }, [debugEnabled]);

  const handleCenterDog = useCallback(() => {
    posRef.current = 0;
    targetRef.current = 0;
    setPosX(0);
    setUserMoveActive(false);
    setMovementAnim(null);
  }, []);

  const handleKillEnergy = useCallback(() => {
    if (!debugEnabled) return;
    dispatch(
      triggerManualAction({
        now: Date.now(),
        action: "sleep",
        stats: { energy: -200 },
      })
    );
  }, [debugEnabled, dispatch]);

  const handleMaxBond = useCallback(() => {
    if (!debugEnabled) return;
    dispatch(
      triggerManualAction({
        now: Date.now(),
        action: "wag",
        bondDelta: 200,
      })
    );
  }, [debugEnabled, dispatch]);

  useEffect(() => {
    if (sleepLocked || commandAnim || userMoveActive) return;
    setAutoAnim(autoBaseAnim);
  }, [autoBaseAnim, commandAnim, sleepLocked, userMoveActive]);

  useEffect(() => {
    if (sleepLocked || commandAnim || userMoveActive) return undefined;

    const decide = () => {
      if (energy <= AUTO_SLEEP_ENERGY) {
        setAutoAnim("sleep");
        return;
      }

      const roll = Math.random();
      const walkCutoff = AUTO_IDLE_CHANCE + AUTO_WAG_CHANCE + AUTO_WALK_CHANCE;
      if (roll >= walkCutoff) {
        setAutoAnim("sit");
        if (autoTimeoutRef.current) {
          window.clearTimeout(autoTimeoutRef.current);
        }
        autoTimeoutRef.current = window.setTimeout(() => {
          setAutoAnim(autoBaseAnim);
        }, AUTO_SIT_MS);
        return;
      }
      if (roll >= AUTO_IDLE_CHANCE + AUTO_WAG_CHANCE) {
        setAutoAnim("walk");
        if (autoTimeoutRef.current) {
          window.clearTimeout(autoTimeoutRef.current);
        }
        autoTimeoutRef.current = window.setTimeout(() => {
          setAutoAnim(autoBaseAnim);
        }, AUTO_WALK_MS);
        return;
      }
      if (roll >= AUTO_IDLE_CHANCE) {
        setAutoAnim("wag");
        return;
      }
      setAutoAnim("idle");
    };

    decide();
    autoIntervalRef.current = window.setInterval(decide, AUTO_DECISION_MS);
    return () => {
      if (autoIntervalRef.current) {
        window.clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
      if (autoTimeoutRef.current) {
        window.clearTimeout(autoTimeoutRef.current);
        autoTimeoutRef.current = null;
      }
    };
  }, [autoBaseAnim, commandAnim, energy, sleepLocked, userMoveActive]);

  useEffect(() => {
    if (turnTimerRef.current) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }
    turningRef.current = false;
    if (baseAnim !== "walk") {
      setMovementAnim(null);
    }
  }, [baseAnim]);

  const maxOffset = useMemo(() => {
    const room = stageWidth / 2 - size * 0.45 - 8;
    return Math.max(40, Math.round(room));
  }, [size, stageWidth]);

  const handleStagePointerDown = useCallback(
    (event) => {
      if (sleepLocked || commandAnim) return;
      const el = stageRef.current;
      if (!el) return;
      const clientX =
        typeof event?.clientX === "number"
          ? event.clientX
          : event?.touches?.[0]?.clientX;
      if (!Number.isFinite(clientX)) return;
      const rect = el.getBoundingClientRect();
      const relative = clientX - (rect.left + rect.width / 2);
      const clamped = Math.max(-maxOffset, Math.min(maxOffset, relative));

      const distanceFromDog = Math.abs(clamped - posRef.current);
      if (distanceFromDog <= TAP_PET_DISTANCE) {
        setUserMoveActive(false);
        setAutoAnim("wag");
        setMovementAnim(null);
        dispatch(triggerManualAction({ now: Date.now(), action: "wag" }));
        return;
      }

      userTargetRef.current = clamped;
      targetRef.current = clamped;
      setUserMoveActive(true);
      setAutoAnim("walk");
      if (clamped !== posRef.current) {
        const dir = clamped >= posRef.current ? 1 : -1;
        facingRef.current = dir;
        setFacing(dir);
      }
    },
    [commandAnim, dispatch, maxOffset, sleepLocked]
  );

  useEffect(() => {
    if (typeof targetX !== "number" || Number.isNaN(targetX)) return;
    if (userMoveActive) return;
    const clamped = Math.max(-maxOffset, Math.min(maxOffset, targetX));
    targetRef.current = clamped;
  }, [maxOffset, targetX]);

  useEffect(() => {
    const explicitDirectional =
      baseAnim === "walk_left" || baseAnim === "walk_right";
    const movementEnabled =
      !reduceMotion && (baseAnim === "walk" || explicitDirectional);
    if (!movementEnabled) return undefined;

    let rafId = 0;
    let last = performance.now();
    const settleAnim = autoBaseAnim === "walk" ? "idle" : autoBaseAnim;

    const pickTarget = () => {
      if (userMoveActive) return;
      if (typeof targetX === "number" && !Number.isNaN(targetX)) return;
      targetRef.current = (Math.random() * 2 - 1) * maxOffset;
    };

    if (Number.isNaN(targetRef.current) || targetRef.current === null) {
      pickTarget();
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const current = posRef.current;
      let dir = 0;
      let distance = 0;

      if (explicitDirectional) {
        dir = baseAnim === "walk_right" ? 1 : -1;
        distance = dir * (maxOffset - Math.abs(current));
        if (dir !== facingRef.current) {
          facingRef.current = dir;
          setFacing(dir);
        }
        setMovementAnim(baseAnim);
      } else {
        const target = userMoveActive
          ? (userTargetRef.current ?? current)
          : (targetRef.current ?? 0);
        if (userMoveActive && Number.isFinite(target)) {
          targetRef.current = target;
        }
        distance = target - current;
        if (Math.abs(distance) < STOP_EPSILON) {
          if (userMoveActive) {
            setUserMoveActive(false);
            setAutoAnim(settleAnim);
            setMovementAnim(null);
            return;
          }
          pickTarget();
        }
        dir = distance >= 0 ? 1 : -1;

        if (dir !== facingRef.current && !turningRef.current) {
          turningRef.current = true;
          setTurnFacing(dir);
          setMovementAnim("turn_walk_right");
          if (turnTimerRef.current) {
            window.clearTimeout(turnTimerRef.current);
          }
          turnTimerRef.current = window.setTimeout(() => {
            facingRef.current = dir;
            setFacing(dir);
            turningRef.current = false;
            setMovementAnim(dir === 1 ? "walk_right" : "walk_left");
          }, TURN_DURATION_MS);
        }

        if (!turningRef.current) {
          setMovementAnim(dir === 1 ? "walk_right" : "walk_left");
        }
      }

      const speed = 20 + Math.max(0, Math.min(100, energy)) * 0.4;
      const step = Math.sign(distance || 1) * speed * dt;
      const next = Math.max(-maxOffset, Math.min(maxOffset, current + step));

      if (
        !explicitDirectional &&
        !userMoveActive &&
        Math.abs(next) >= maxOffset - STOP_EPSILON
      ) {
        pickTarget();
      }

      posRef.current = next;
      setPosX(next);

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    autoBaseAnim,
    baseAnim,
    energy,
    maxOffset,
    reduceMotion,
    targetX,
    userMoveActive,
  ]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#05070d] via-[#07090f] to-black/70 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/80" />
      {reduceMotion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      ) : null}
      {debugEnabled && debugOpen ? (
        <DebugMenu
          onClose={() => setDebugOpen(false)}
          onAnim={(anim) => handleDebugAnim(anim)}
          onClearAnim={clearDebugAnim}
          onCenterDog={handleCenterDog}
          onKillEnergy={handleKillEnergy}
          onMaxBond={handleMaxBond}
        />
      ) : null}
      <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={() => setPassportOpen((v) => !v)}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur"
        >
          Passport
          <span className="text-[9px]">{passportOpen ? "−" : "+"}</span>
        </button>
        <div
          className={[
            "origin-top-right transition",
            passportOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0 scale-95",
          ].join(" ")}
        >
          <PuppyPassport
            dog={dog}
            className="w-56 rotate-0 sm:w-60 lg:w-64 lg:rotate-1"
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-[320px] items-center justify-center px-3 py-6 sm:min-h-[360px] lg:min-h-[420px]">
        <div
          className="relative w-full"
          ref={stageRef}
          onPointerDown={handleStagePointerDown}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="relative flex justify-center">
            <div
              className="relative"
              style={{ transform: `translateX(${posX}px)` }}
            >
              <div className="dz-stage-floating">
                <div
                  aria-hidden
                  className="dz-stage-shadow pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2 z-0"
                />
                <div className="relative z-10 flex justify-center">
                  {renderMode === "realistic" ? (
                    <RealisticDog
                      anim={realisticAnim}
                      stage={renderParams.stage}
                      facing={displayFacing}
                      size={size}
                      reduceMotion={reduceMotion}
                      energy={energy}
                      className="block"
                      onDebug={setAnimDebug}
                    />
                  ) : (
                    <SpriteSheetDog
                      stage={renderParams.stage}
                      condition={renderParams.condition}
                      anim={conditionAnim}
                      facing={displayFacing}
                      size={size}
                      reduceMotion={reduceMotion}
                      className="block"
                      onDebug={setAnimDebug}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 pb-5 pt-3 text-[11px] uppercase tracking-[0.35em] text-white/60">
        <button
          type="button"
          onPointerDown={handleDebugTap}
          className="text-left tracking-[0.35em] text-white/60"
        >
          {dog?.name || "Pup"}
        </button>
        <span>{scene?.label || "Backyard"}</span>
        <span>{scene?.timeOfDay || "Night"}</span>
        <span
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em]"
          style={scene?.weatherAccent ? { color: scene.weatherAccent } : null}
        >
          {scene?.weather || "Clear"}
        </span>
        <span className="text-[10px] text-white/40">{frameLabel}</span>
      </div>
    </section>
  );
}

function DebugMenu({
  onClose,
  onAnim,
  onClearAnim,
  onCenterDog,
  onKillEnergy,
  onMaxBond,
}) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-black/70 p-6 font-mono shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm uppercase tracking-[0.35em] text-white/80">
            Dev Console
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => onAnim("front_flip")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-emerald-400/40"
          >
            Force Flip
          </button>
          <button
            type="button"
            onClick={() => onAnim("jump")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-emerald-400/40"
          >
            Force Jump
          </button>
          <button
            type="button"
            onClick={() => onAnim("stray_walk")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-emerald-400/40"
          >
            Force Stray
          </button>
          <button
            type="button"
            onClick={() => onAnim("sleep")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-emerald-400/40"
          >
            Force Sleep
          </button>
          <button
            type="button"
            onClick={() => onAnim("wag")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-emerald-400/40"
          >
            Force Wag
          </button>
          <button
            type="button"
            onClick={() => onAnim("idle")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-emerald-400/40"
          >
            Force Idle
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={onKillEnergy}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-amber-400/40"
          >
            Kill Energy
          </button>
          <button
            type="button"
            onClick={onMaxBond}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-amber-400/40"
          >
            Max Bond
          </button>
          <button
            type="button"
            onClick={onCenterDog}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-amber-400/40"
          >
            Center Dog
          </button>
          <button
            type="button"
            onClick={onClearAnim}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:border-amber-400/40"
          >
            Clear Override
          </button>
        </div>
      </div>
    </div>
  );
}
