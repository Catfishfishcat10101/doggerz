import { useEffect, useMemo, useRef, useState } from "react";
import { clamp, toPercent } from "./sceneTokens.js";
import "./DogMoodFxLayer.css";

const DIRTY_CONDITIONS = new Set(["dirty", "fleas", "mange"]);

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function randomBetween(min, max) {
  const lo = Number(min || 0);
  const hi = Number(max || lo);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return lo;
  return lo + Math.random() * (hi - lo);
}

function useTimeoutBucket() {
  const timeoutsRef = useRef(new Set());

  useEffect(
    () => () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current.clear();
    },
    []
  );

  return {
    track(id) {
      if (!id) return;
      timeoutsRef.current.add(id);
    },
    release(id) {
      if (!id) return;
      timeoutsRef.current.delete(id);
    },
    clearAll() {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current.clear();
    },
  };
}

export default function DogMoodFxLayer({
  dog,
  renderModel,
  brainState,
  sceneLayout,
  reduceMotion = false,
}) {
  const counterRef = useRef(0);
  const prevBarkingRef = useRef(false);
  const [heartPops, setHeartPops] = useState([]);
  const [barkBursts, setBarkBursts] = useState([]);
  const timeouts = useTimeoutBucket();

  const dogXNorm = clamp(Number(sceneLayout?.dog?.xNorm || 0.5), 0.05, 0.95);
  const dogGroundYNorm = clamp(
    Number(sceneLayout?.dog?.groundYNorm || 0.8),
    0.56,
    0.94
  );
  const headYNorm = clamp(dogGroundYNorm - 0.28, 0.08, 0.8);
  const facing = brainState?.facing === "left" ? "left" : "right";
  const snoutXNorm = clamp(
    dogXNorm + (facing === "left" ? -0.08 : 0.08),
    0.02,
    0.98
  );
  const snoutYNorm = clamp(dogGroundYNorm - 0.2, 0.08, 0.92);
  const overlayWidthPct = clamp(
    Number(sceneLayout?.dog?.widthRatio || 0.26) * 72,
    14,
    24
  );
  const overlayHeightPct = clamp(overlayWidthPct * 1.3, 18, 31);

  const energy = Number(dog?.stats?.energy ?? 100);
  const hunger = Number(dog?.stats?.hunger ?? 0);
  const happiness = Number(dog?.stats?.happiness ?? 0);
  const lastAction = normalizeKey(dog?.lastAction || dog?.last_action || "");
  const mood = normalizeKey(dog?.mood || "");
  const condition = normalizeKey(
    renderModel?.condition || dog?.cleanlinessState || "clean"
  );

  const sleepyActive =
    Boolean(brainState?.isSleeping) ||
    energy <= 30 ||
    mood.includes("sleep") ||
    lastAction.includes("sleep");
  const hungerActive = hunger >= 65;
  const dirtyOverlayActive = DIRTY_CONDITIONS.has(condition);
  const fleasActive = condition === "fleas";
  const heartMode =
    /pet|cuddle|hug|love|affection|praise|reward|bond/.test(lastAction) ||
    (happiness >= 80 && !hungerActive && !sleepyActive);
  const barkingActive =
    Boolean(brainState?.isBarking) ||
    lastAction.includes("bark") ||
    lastAction === "speak";

  const statusIcons = useMemo(() => {
    const items = [];
    if (sleepyActive) {
      items.push({ id: "sleepy", icon: "😴", label: "Sleepy" });
    }
    if (hungerActive) {
      items.push({ id: "hungry", icon: "🍖", label: "Hungry" });
    }
    return items;
  }, [hungerActive, sleepyActive]);

  useEffect(() => {
    if (reduceMotion || !heartMode) {
      setHeartPops([]);
      return undefined;
    }

    let cancelled = false;

    const spawnHeart = () => {
      if (cancelled) return;
      const id = `heart-${Date.now()}-${counterRef.current++}`;
      const pop = {
        id,
        xNorm: clamp(dogXNorm + randomBetween(-0.03, 0.03), 0.03, 0.97),
        yNorm: clamp(headYNorm + randomBetween(-0.01, 0.02), 0.04, 0.92),
        dx: randomBetween(-16, 16),
        dy: randomBetween(-62, -36),
        durationMs: randomBetween(1020, 1380),
      };
      setHeartPops((current) => [...current.slice(-6), pop]);

      const cleanupId = window.setTimeout(
        () => {
          setHeartPops((current) => current.filter((item) => item.id !== id));
          timeouts.release(cleanupId);
        },
        Math.round(pop.durationMs + 80)
      );
      timeouts.track(cleanupId);
    };

    spawnHeart();
    const intervalMs = Math.round(randomBetween(880, 1220));
    const intervalId = window.setInterval(spawnHeart, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [dogXNorm, headYNorm, heartMode, reduceMotion, timeouts]);

  useEffect(() => {
    if (reduceMotion) {
      prevBarkingRef.current = barkingActive;
      setBarkBursts([]);
      return;
    }

    const isRisingEdge = barkingActive && !prevBarkingRef.current;
    prevBarkingRef.current = barkingActive;
    if (!isRisingEdge) return;

    const particleCount = 8;
    const direction = facing === "left" ? -1 : 1;
    const nextBursts = Array.from({ length: particleCount }, (_, index) => {
      const id = `bark-${Date.now()}-${counterRef.current++}-${index}`;
      return {
        id,
        xNorm: clamp(snoutXNorm + randomBetween(-0.01, 0.01), 0.02, 0.98),
        yNorm: clamp(snoutYNorm + randomBetween(-0.015, 0.015), 0.04, 0.96),
        dx: direction * randomBetween(20, 54),
        dy: randomBetween(-24, 18),
        durationMs: randomBetween(520, 760),
      };
    });

    setBarkBursts((current) => [...current.slice(-10), ...nextBursts]);

    nextBursts.forEach((burst) => {
      const cleanupId = window.setTimeout(
        () => {
          setBarkBursts((current) =>
            current.filter((item) => item.id !== burst.id)
          );
          timeouts.release(cleanupId);
        },
        Math.round(burst.durationMs + 120)
      );
      timeouts.track(cleanupId);
    });
  }, [barkingActive, facing, reduceMotion, snoutXNorm, snoutYNorm, timeouts]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[24]"
      aria-hidden="true"
    >
      {statusIcons.length ? (
        <div
          className="absolute flex items-center justify-center gap-1"
          style={{
            left: toPercent(dogXNorm),
            top: toPercent(clamp(headYNorm - 0.08, 0.02, 0.82)),
            transform: "translate(-50%, -50%)",
          }}
        >
          {statusIcons.map((item) => (
            <span key={item.id} className="dg-dog-fx-badge" title={item.label}>
              {item.icon}
            </span>
          ))}
        </div>
      ) : null}

      {dirtyOverlayActive ? (
        <div
          className="absolute"
          style={{
            left: toPercent(dogXNorm),
            top: toPercent(clamp(dogGroundYNorm - 0.16, 0.05, 0.92)),
            width: `${overlayWidthPct}%`,
            height: `${overlayHeightPct}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="dg-dog-fx-dirt-overlay absolute inset-0" />
          {fleasActive
            ? Array.from({ length: 7 }).map((_, index) => {
                const x = 12 + index * 11;
                const y =
                  index % 2 === 0
                    ? 30 + (index % 3) * 12
                    : 18 + (index % 3) * 11;
                return (
                  <span
                    key={`flea-${index}`}
                    className="dg-dog-fx-flea-dot"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      animationDelay: `${(index * 0.07).toFixed(2)}s`,
                      "--dg-flea-dx": `${(index % 2 === 0 ? 1 : -1) * (2 + (index % 3))}px`,
                      "--dg-flea-dy": `${(index % 2 === 0 ? -1 : 1) * (1 + (index % 2))}px`,
                    }}
                  />
                );
              })
            : null}
        </div>
      ) : null}

      {heartPops.map((heart) => (
        <span
          key={heart.id}
          className="dg-dog-fx-heart-pop"
          style={{
            left: toPercent(heart.xNorm),
            top: toPercent(heart.yNorm),
            "--dg-fx-dx": `${heart.dx}px`,
            "--dg-fx-dy": `${heart.dy}px`,
            "--dg-fx-duration": `${heart.durationMs}ms`,
          }}
        >
          💗
        </span>
      ))}

      {barkBursts.map((particle) => (
        <span
          key={particle.id}
          className="dg-dog-fx-bark-particle"
          style={{
            left: toPercent(particle.xNorm),
            top: toPercent(particle.yNorm),
            "--dg-fx-dx": `${particle.dx}px`,
            "--dg-fx-dy": `${particle.dy}px`,
            "--dg-fx-duration": `${particle.durationMs}ms`,
          }}
        />
      ))}
    </div>
  );
}
