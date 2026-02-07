/** @format */
// src/features/game/DogStage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import SpriteSheetDog from "@/components/SpriteSheetDog.jsx";
import { selectDogRenderParams } from "@/features/dog/dogSelectors.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { getCheckInTier, resolveConditionPrefix } from "@/utils/checkIn.js";
import { useDogActionSfx } from "@/features/audio/useDogActionSfx.js";

const TURN_DURATION_MS = 320;
const STOP_EPSILON = 6;

export default function DogStage({ dog, scene, targetX = null }) {
  const settings = useSelector(selectSettings);
  const frameLabel = dog?.lifeStage?.label || "Puppy";

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
    (reduceMotionSetting !== "off" && prefersReducedMotion);

  const renderParams = useMemo(() => {
    if (dog && typeof dog === "object") return selectDogRenderParams(dog);
    return selectDogRenderParams({ stage: "PUPPY" });
  }, [dog]);
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
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const facingRef = useRef(1);
  const turningRef = useRef(false);
  const turnTimerRef = useRef(null);

  const baseAnim = renderParams.anim;
  const explicitAnim =
    baseAnim === "walk_left" ||
    baseAnim === "walk_right" ||
    baseAnim === "turn_walk_right";

  const displayAnim = explicitAnim ? baseAnim : movementAnim || baseAnim;
  const turningAnim = displayAnim === "turn_walk_right";
  const displayFacing = explicitAnim
    ? baseAnim === "walk_left"
      ? -1
      : 1
    : turningAnim
      ? turnFacing
      : facing;

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

  useDogActionSfx({
    anim: animDebug?.activeAnim || conditionAnim,
    frameIndex: animDebug?.activeFrameIndex,
    energy: dog?.stats?.energy,
    tier: checkIn?.tier,
    audio: settings?.audio,
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
    };
  }, []);

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

  useEffect(() => {
    if (typeof targetX !== "number" || Number.isNaN(targetX)) return;
    const clamped = Math.max(-maxOffset, Math.min(maxOffset, targetX));
    targetRef.current = clamped;
  }, [maxOffset, targetX]);

  useEffect(() => {
    const movementEnabled = baseAnim === "walk" && !reduceMotion && !explicitAnim;
    if (!movementEnabled) return undefined;

    let rafId = 0;
    let last = performance.now();

    const pickTarget = () => {
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
      const target = targetRef.current ?? 0;
      const distance = target - current;
      const absDistance = Math.abs(distance);

      if (absDistance < STOP_EPSILON) {
        pickTarget();
      }

      const dir = distance >= 0 ? 1 : -1;
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

      const energy = Number(dog?.stats?.energy ?? 50);
      const speed = 20 + Math.max(0, Math.min(100, energy)) * 0.4;
      const step = Math.sign(distance || 1) * Math.min(absDistance, speed * dt);
      const next = current + step;

      posRef.current = next;
      setPosX(next);

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [baseAnim, dog?.stats?.energy, explicitAnim, maxOffset, reduceMotion, targetX]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#05070d] via-[#07090f] to-black/70 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/80" />
      {reduceMotion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      ) : null}

      <div className="relative z-10 flex min-h-[320px] items-center justify-center px-3 py-6 sm:min-h-[360px] lg:min-h-[420px]">
        <div className="relative w-full" ref={stageRef}>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 pb-5 pt-3 text-[11px] uppercase tracking-[0.35em] text-white/60">
        <span>{dog?.name || "Pup"}</span>
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
