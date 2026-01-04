// src/features/game/components/YardDogActor.jsx
// @ts-nocheck

import * as React from "react";

import LayeredDogRig from "@/features/game/components/LayeredDogRig.jsx";
import SpriteSheetDog from "@/features/game/components/SpriteSheetDog.jsx";
import DogCosmeticsOverlay from "@/features/game/components/DogCosmeticsOverlay.jsx";
import { withBaseUrl } from "@/utils/assetUrl.js";
import { YARD_PROP_GROUND_POSITIONS } from "@/features/game/yardProps.js";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function randRange(rng, a, b) {
  return a + (b - a) * rng();
}

function useRng(seed = 1234567) {
  return React.useMemo(() => {
    // xorshift32
    let s = Number(seed) >>> 0 || 1;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  }, [seed]);
}

const DEFAULTS = {
  // how far (in %) the dog can roam within the stage
  roamPaddingPct: 10,
  // baseline speeds in % per second
  walkSpeed: 12,
  playSpeed: 22,
  // how often we choose a new roam target
  roamMinMs: 2500,
  roamMaxMs: 5200,
  // critter behavior
  critterSpawnMinMs: 4200,
  critterSpawnMaxMs: 7800,
};

// Fixed prop positions (match YardSetDressing)
const FOOD_BOWL_POS = { ...YARD_PROP_GROUND_POSITIONS.bowl };
const WATER_BOWL_POS = { ...YARD_PROP_GROUND_POSITIONS.water };
const BALL_POS = { ...YARD_PROP_GROUND_POSITIONS.ball };
const HOUSE_POS = { ...YARD_PROP_GROUND_POSITIONS.house };

function distPct(a, b) {
  return Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0));
}

function isNear(a, b, threshold = 2.2) {
  return distPct(a, b) <= threshold;
}

export default function YardDogActor({
  spriteSrc,
  lifeStageStage,
  size = 320,
  reduceMotion = false,
  reduceTransparency = false,
  isNight = false,
  isAsleep = false,
  critterEnabled = true,
  roamIntensity = 1,
  // High-level intent from the yard UI (and optional commandId for training).
  // Common intents: idle | eat | drink | sleep | rest | play | fetch | train | potty | poop | bark | shake
  intent = "idle",
  commandId,
  useRig = false,
  // SpriteSheetDog will only animate when a real-frame manifest exists.
  // Keeping this on by default means "real" animations appear automatically
  // after you add frames + run the build script.
  useSpritePack = true,

  // Cosmetics
  cosmeticsEquipped,

  // Interaction
  onPet,
}) {
  const debugSprite = React.useMemo(() => {
    const allowDebug = (() => {
      try {
        const v =
          String(import.meta.env.VITE_ENABLE_DEBUG || "false") === "true";
        return Boolean(import.meta.env.DEV) || v;
      } catch {
        return false;
      }
    })();

    if (!allowDebug) return false;

    try {
      const qs = new URLSearchParams(window.location?.search || "");
      const viaQuery = qs.get("dgDebugSprite") === "1";
      const viaStorage = localStorage.getItem("DG_DEBUG_SPRITE") === "1";
      return viaQuery || viaStorage;
    } catch {
      return false;
    }
  }, []);

  const [spriteDebug, setSpriteDebug] = React.useState(null);
  const [spriteChecks, setSpriteChecks] = React.useState(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!debugSprite) return;

    let cancelled = false;

    const checkUrl = async (label, url) => {
      if (!url)
        return {
          label,
          url: null,
          ok: false,
          status: 0,
          type: null,
          error: "no url",
        };
      try {
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });
        return {
          label,
          url,
          ok: res.ok,
          status: res.status,
          type: res.headers.get("content-type"),
        };
      } catch (e) {
        return {
          label,
          url,
          ok: false,
          status: 0,
          type: null,
          error: String(e?.message || e),
        };
      }
    };

    const run = async () => {
      const baseUrl = String(import.meta.env.BASE_URL || "/");

      const manifestUrl = withBaseUrl("/sprites/anim/jrt/manifest.json");
      const stripUrl = spriteDebug?.sheetSrc || null;
      const fallbackUrl =
        spriteDebug?.effectiveFallbackSrc || spriteSrc || null;

      const sw = (() => {
        try {
          return {
            controller: !!navigator.serviceWorker?.controller,
          };
        } catch {
          return { controller: false };
        }
      })();

      const results = await Promise.all([
        checkUrl("manifest", manifestUrl),
        checkUrl("strip", stripUrl),
        checkUrl("fallback", fallbackUrl),
      ]);

      if (cancelled) return;
      setSpriteChecks({
        baseUrl,
        sw,
        results,
      });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    debugSprite,
    spriteDebug?.effectiveFallbackSrc,
    spriteDebug?.sheetSrc,
    spriteSrc,
  ]);

  const rng = useRng((0xd09e5eed ^ Date.now()) >>> 0);

  // NOTE: y is the "ground contact" point (we translate the sprite up by 100%).
  // Keep it close to the bottom so the dog doesn't appear to float.
  const [pos, setPos] = React.useState({ x: 50, y: 92 }); // in %
  const targetRef = React.useRef({ x: 50, y: 92 });
  const lastPickRef = React.useRef(0);

  // Idle pacing: pause briefly at targets so idle animations can show.
  const pauseUntilRef = React.useRef(0);

  // Occasional idle emotes when standing still.
  const idleEmoteRef = React.useRef(null); // 'wag' | 'sniff' | 'scratch' | null
  const idleEmoteUntilRef = React.useRef(0);
  const idleNextEmoteAtRef = React.useRef(0);

  // 1 = moving right, -1 = moving left
  const [facing, setFacing] = React.useState(1);
  // The authored strips appear to face left by default, so flip the art.
  const artFacing = -facing;

  const [critter, setCritter] = React.useState(null);
  const critterNextAtRef = React.useRef(0);

  const pettingRef = React.useRef(false);
  const petTimerRef = React.useRef(null);
  const lastPetAtRef = React.useRef(0);

  const rafRef = React.useRef(null);
  const lastTRef = React.useRef(0);

  const intensity = clamp(roamIntensity, 0, 1);
  const speedScale = 0.15 + 0.85 * intensity;
  const isPlayIntent = intent === "play" || intent === "fetch";
  const speed =
    (isPlayIntent || intent === "run"
      ? DEFAULTS.playSpeed
      : DEFAULTS.walkSpeed) * speedScale;

  // When eating, we want the dog to WALK to the bowl first, then eat.
  const atBowl = isNear(pos, FOOD_BOWL_POS, 2.6);
  const atWater = isNear(pos, WATER_BOWL_POS, 2.6);
  const atBall = isNear(pos, BALL_POS, 2.6);
  const atHouse = isNear(pos, HOUSE_POS, 3.2);
  const locked =
    isAsleep ||
    intent === "train" ||
    intent === "poop" ||
    intent === "pee" ||
    (intent === "eat" && atBowl) ||
    (intent === "drink" && atWater) ||
    ((intent === "rest" || intent === "sleep") && atHouse) ||
    (isPlayIntent && atBall);
  const distToTarget = Math.hypot(
    (targetRef.current?.x ?? pos.x) - pos.x,
    (targetRef.current?.y ?? pos.y) - pos.y
  );
  const isMoving = !locked && distToTarget > 0.6;

  const chooseNewTarget = React.useCallback(
    (now) => {
      const pad = DEFAULTS.roamPaddingPct;
      const x = randRange(rng, pad, 100 - pad);
      // Keep targets on the "ground" band of the background.
      const y = randRange(rng, 90, 94);
      targetRef.current = { x, y };
      lastPickRef.current = now;
    },
    [rng]
  );

  const maybeSpawnCritter = React.useCallback(
    (now) => {
      if (!critterEnabled) return;
      if (reduceMotion) return;
      if (isNight) return;
      if (critter) return;

      if (!critterNextAtRef.current) {
        critterNextAtRef.current =
          now +
          randRange(
            rng,
            DEFAULTS.critterSpawnMinMs,
            DEFAULTS.critterSpawnMaxMs
          );
        return;
      }

      if (now < critterNextAtRef.current) return;

      // Spawn a butterfly/bug that floats across.
      const startX = randRange(rng, 5, 95);
      const startY = randRange(rng, 38, 62);
      const dir = rng() > 0.5 ? 1 : -1;
      setCritter({
        x: startX,
        y: startY,
        vx: dir * randRange(rng, 8, 14),
        vy: randRange(rng, -2, 2),
        phase: randRange(rng, 0, Math.PI * 2),
        bornAt: now,
      });

      // schedule next spawn later
      critterNextAtRef.current =
        now +
        randRange(rng, DEFAULTS.critterSpawnMinMs, DEFAULTS.critterSpawnMaxMs);
    },
    [critter, critterEnabled, isNight, reduceMotion, rng]
  );

  React.useEffect(() => {
    if (reduceMotion) return;

    const tick = (t) => {
      const now = t;
      const dt = Math.min(0.05, (now - (lastTRef.current || now)) / 1000);
      lastTRef.current = now;

      // Critter movement + expiration
      if (critter) {
        const ageMs = now - critter.bornAt;
        const wiggle = Math.sin((now / 1000) * 3 + critter.phase) * 1.8;
        const next = {
          ...critter,
          x: critter.x + critter.vx * dt,
          y: clamp(critter.y + (critter.vy + wiggle) * dt, 28, 70),
        };

        // If critter goes off-screen or lives too long, despawn.
        if (ageMs > 9000 || next.x < -10 || next.x > 110) {
          setCritter(null);
        } else {
          setCritter(next);

          // Dog gets curious: nudge target toward critter sometimes.
          if (intent === "idle") {
            const dx = next.x - pos.x;
            const dy = next.y + 12 - pos.y; // dog is lower
            const dist = Math.hypot(dx, dy);
            if (dist < 28 && rng() > 0.75) {
              // Curiosity should not pull the dog off the ground.
              targetRef.current = {
                x: clamp(next.x, 12, 88),
                y: clamp(pos.y, 90, 94),
              };
              lastPickRef.current = now;
            }
          }
        }
      }

      // Choose new roam target periodically (unless sleeping/eating/training)
      // Eating: go to the food bowl.
      if (intent === "eat" && !atBowl) {
        targetRef.current = { ...FOOD_BOWL_POS };
        lastPickRef.current = now;
        // Cancel idle pause while heading to the bowl.
        pauseUntilRef.current = 0;
        idleEmoteRef.current = null;
        idleEmoteUntilRef.current = 0;
      } else if (intent === "drink" && !atWater) {
        targetRef.current = { ...WATER_BOWL_POS };
        lastPickRef.current = now;
        pauseUntilRef.current = 0;
        idleEmoteRef.current = null;
        idleEmoteUntilRef.current = 0;
      } else if (isPlayIntent && !atBall) {
        targetRef.current = { ...BALL_POS };
        lastPickRef.current = now;
        pauseUntilRef.current = 0;
        idleEmoteRef.current = null;
        idleEmoteUntilRef.current = 0;
      } else if ((intent === "rest" || intent === "sleep") && !atHouse) {
        targetRef.current = { ...HOUSE_POS };
        lastPickRef.current = now;
        pauseUntilRef.current = 0;
        idleEmoteRef.current = null;
        idleEmoteUntilRef.current = 0;
      } else if (!locked) {
        const sincePick = now - (lastPickRef.current || 0);
        const roamScale = 1.75 - 1.25 * intensity; // lower intensity = slower target changes
        const nextIn =
          randRange(rng, DEFAULTS.roamMinMs, DEFAULTS.roamMaxMs) * roamScale;

        const distToTargetNow = Math.hypot(
          (targetRef.current?.x ?? pos.x) - pos.x,
          (targetRef.current?.y ?? pos.y) - pos.y
        );
        // If we just arrived at a target, pause for a beat before picking a new one.
        if (distToTargetNow < 0.55 && now >= (pauseUntilRef.current || 0)) {
          pauseUntilRef.current =
            now + randRange(rng, 900, 2200) * (1.2 - 0.6 * intensity);
        }

        const paused = now < (pauseUntilRef.current || 0);

        if (!paused && (!lastPickRef.current || sincePick > nextIn)) {
          chooseNewTarget(now);
        }
      }

      // Move toward target
      if (!locked) {
        const paused = now < (pauseUntilRef.current || 0);
        // While paused, don't drift or retarget; this lets idle/emote anims read.
        if (paused) {
          // Occasionally trigger an idle emote while standing still.
          if (intent === "idle") {
            const emoteActive = now < (idleEmoteUntilRef.current || 0);
            if (!emoteActive && now >= (idleNextEmoteAtRef.current || 0)) {
              // 45% chance each pause window.
              if (rng() > 0.55) {
                // Mix in expressive anims so the dog feels alive.
                const emotes = [
                  "wag",
                  "sniff",
                  "pant",
                  "lick",
                  "yawn",
                  "stretch",
                  "shake",
                  "scratch",
                  "bow",
                  "beg",
                  "sit_pretty",
                  "play_dead",
                  "roll",
                  "bark",
                ];
                idleEmoteRef.current =
                  emotes[Math.floor(rng() * emotes.length)] || "wag";
                idleEmoteUntilRef.current = now + randRange(rng, 1100, 1900);
              }
              idleNextEmoteAtRef.current = now + randRange(rng, 6000, 12000);
            }
          }

          maybeSpawnCritter(now);
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        setPos((p) => {
          const tx = targetRef.current.x;
          const ty = targetRef.current.y;
          const dx = tx - p.x;
          const dy = ty - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.2) return p;

          // Facing should match motion direction. Doing it here ensures we use the
          // same "p" as the movement step (avoids looking like it's walking backwards).
          if (Math.abs(dx) > 0.4) setFacing(dx >= 0 ? 1 : -1);

          const step = speed * dt;
          const nx = p.x + (dx / dist) * Math.min(step, dist);
          const ny = p.y + (dy / dist) * Math.min(step * 0.55, dist);
          return { x: clamp(nx, 8, 92), y: clamp(ny, 88, 96) };
        });
      }

      maybeSpawnCritter(now);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    atBall,
    atBowl,
    atHouse,
    atWater,
    chooseNewTarget,
    critter,
    distToTarget,
    intent,
    intensity,
    isAsleep,
    isPlayIntent,
    locked,
    maybeSpawnCritter,
    pos.x,
    pos.y,
    reduceMotion,
    rng,
    speed,
  ]);

  const showCritter = !!critter && !reduceTransparency;

  const triggerPet = React.useCallback(() => {
    if (typeof onPet !== "function") return;
    const now = Date.now();
    if (now - lastPetAtRef.current < 900) return;
    lastPetAtRef.current = now;
    onPet();
  }, [onPet]);

  const stopPetting = React.useCallback(() => {
    pettingRef.current = false;
    if (petTimerRef.current) {
      window.clearInterval(petTimerRef.current);
      petTimerRef.current = null;
    }
  }, []);

  const startPetting = React.useCallback(() => {
    if (typeof onPet !== "function") return;
    pettingRef.current = true;
    triggerPet();
    if (petTimerRef.current) window.clearInterval(petTimerRef.current);
    petTimerRef.current = window.setInterval(() => {
      if (!pettingRef.current) return;
      triggerPet();
    }, 1200);
  }, [onPet, triggerPet]);

  React.useEffect(() => {
    return () => stopPetting();
  }, [stopPetting]);

  // Treat the high-level "sleep" intent as a visual sleep state too.
  // (The Redux sleep flag may flip on the next tick, but we want immediate feedback.)
  const sleepActive = isAsleep || intent === "rest" || intent === "sleep";

  // Map high-level yard intent into a more expressive rig state.
  const rigPose = sleepActive ? "lay" : intent === "train" ? "sit" : "stand";

  const rigMood = sleepActive
    ? "sleepy"
    : isPlayIntent || (intent === "idle" && !!critter)
      ? "curious"
      : "idle";

  const rigAction =
    intent === "eat"
      ? "eat"
      : isPlayIntent || intent === "potty"
        ? "walk"
        : "idle";

  // Sprite-pack animation mapping
  const isRunning =
    (isPlayIntent || intent === "run") && isMoving && intensity > 0.55;

  const spriteAnim = (() => {
    if (isAsleep || intent === "sleep") return "sleep";
    if (intent === "rest") return "lay";
    if (intent === "eat") return atBowl ? "eat" : "walk";
    if (intent === "drink") return atWater ? "drink" : "walk";
    if (isPlayIntent) {
      if (atBall && !isMoving) return "fetch";
      if (isRunning) return "run";
      return "walk";
    }
    if (
      intent === "bark" ||
      intent === "howl" ||
      intent === "poop" ||
      intent === "pee" ||
      intent === "shake" ||
      intent === "scratch" ||
      intent === "sniff" ||
      intent === "wag" ||
      intent === "pant" ||
      intent === "lick" ||
      intent === "yawn" ||
      intent === "stretch" ||
      intent === "dig" ||
      intent === "jump" ||
      intent === "roll" ||
      intent === "stay" ||
      intent === "paw" ||
      intent === "spin" ||
      intent === "bow" ||
      intent === "beg" ||
      intent === "sit_pretty" ||
      intent === "play_dead" ||
      intent === "fetch" ||
      intent === "celebrate" ||
      intent === "sad" ||
      intent === "surprised"
    ) {
      return intent;
    }

    // Idle emotes (only when standing still)
    if (intent === "idle" && !isMoving) {
      const now = Date.now();
      if (now < (idleEmoteUntilRef.current || 0) && idleEmoteRef.current) {
        return idleEmoteRef.current;
      }
    }

    if (intent === "train") {
      const cmd = String(commandId || "");
      if (cmd === "speak") return "bark";
      if (cmd === "rollOver") return "roll";
      if (cmd === "stay") return "stay";
      if (cmd === "sit") return "sit";
      return "sit";
    }

    if (isRunning) return "run";
    if (intent === "potty" || isMoving) return "walk";
    return "idle";
  })();

  const stageKey = String(lifeStageStage || "PUPPY").toUpperCase();
  const showEarOverlay = !useSpritePack && stageKey === "PUPPY";

  // Intent overlays
  const bubble = (() => {
    if (sleepActive) return "zzz";
    if (intent === "eat") return "nom";
    if (intent === "train") return "sit";
    if (intent === "bark") return "woof";
    if (intent === "poop" || intent === "pee" || intent === "potty")
      return "...";
    return null;
  })();

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <style>{`
        @keyframes dg-breathe {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-2px,0) scale(1.01); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes dg-look {
          0% { transform: translate3d(0,0,0) rotate(0deg); }
          40% { transform: translate3d(0,0,0) rotate(-0.8deg); }
          70% { transform: translate3d(0,0,0) rotate(0.6deg); }
          100% { transform: translate3d(0,0,0) rotate(0deg); }
        }
        @keyframes dg-hop {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-6px,0); }
          100% { transform: translate3d(0,0,0); }
        }
        @keyframes dg-sprite-bob {
          0% { transform: translate3d(0,0,0) rotate(0deg); }
          50% { transform: translate3d(0,-2px,0) rotate(0.4deg); }
          100% { transform: translate3d(0,0,0) rotate(0deg); }
        }
        @keyframes dg-walk {
          0% { transform: translate3d(0,0,0) rotate(-1.2deg) scaleY(0.99); }
          25% { transform: translate3d(0,-2px,0) rotate(0.8deg) scaleY(1); }
          50% { transform: translate3d(0,0,0) rotate(1.2deg) scaleY(0.99); }
          75% { transform: translate3d(0,-2px,0) rotate(-0.8deg) scaleY(1); }
          100% { transform: translate3d(0,0,0) rotate(-1.2deg) scaleY(0.99); }
        }
      `}</style>

      {showCritter ? (
        <div
          className="absolute"
          style={{
            left: `${critter.x}%`,
            top: `${critter.y}%`,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 0 10px rgba(253,230,138,0.28))",
            opacity: 0.9,
            fontSize: 16,
            animation: reduceMotion
              ? "none"
              : "dg-hop 1.2s ease-in-out infinite",
          }}
        >
          🦋
        </div>
      ) : null}

      <div
        className="absolute"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: "translate(-50%, -100%)",
        }}
      >
        {/* Shadow */}
        <div
          className="absolute left-1/2"
          style={{
            bottom: 4,
            transform: "translateX(-50%)",
            width: Math.max(140, Math.round(size * 0.68)),
            height: 22,
            borderRadius: 999,
            background: "rgba(0,0,0,0.35)",
            filter: reduceTransparency ? "none" : "blur(10px)",
            opacity: reduceTransparency ? 0.25 : 0.5,
          }}
        />

        {/* Thought bubble */}
        {bubble ? (
          <div
            className="absolute"
            style={{
              left: "65%",
              top: "-18%",
              transform: "translate(-50%, -50%)",
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.9)",
              backdropFilter: reduceTransparency ? "none" : "blur(10px)",
            }}
          >
            {bubble}
          </div>
        ) : null}

        {/* Dog */}
        <div
          style={{
            width: size,
            height: size,
            position: "relative",
            transformOrigin: "50% 100%",
            pointerEvents: typeof onPet === "function" ? "auto" : "none",
            cursor: typeof onPet === "function" ? "pointer" : "default",
            // Sprite strips already animate; avoid extra pulsing/looking.
            animation: reduceMotion
              ? "none"
              : sleepActive
                ? "dg-breathe 4.4s ease-in-out infinite"
                : "none",
          }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            startPetting();
          }}
          onPointerUp={() => stopPetting()}
          onPointerLeave={() => stopPetting()}
          onPointerCancel={() => stopPetting()}
        >
          {useRig ? (
            <LayeredDogRig
              fallbackSrc={spriteSrc}
              size={size}
              pose={rigPose}
              mood={rigMood}
              action={rigAction}
              lifeStageStage={lifeStageStage}
              reduceMotion={reduceMotion}
              reduceTransparency={reduceTransparency}
              className="select-none"
            />
          ) : (
            <div
              className="select-none"
              style={{
                width: size,
                height: size,
                position: "relative",
                transformOrigin: "50% 100%",
                // Make the pup feel less "round" without needing new art.
                transform: "scaleX(0.92) scaleY(1.03)",
              }}
            >
              {/* Pointy ear overlay to read more like a puppy */}
              {showEarOverlay ? (
                <div
                  className="absolute inset-0"
                  style={{
                    pointerEvents: "none",
                    transform: `scaleX(${artFacing})`,
                    transformOrigin: "50% 50%",
                    opacity: reduceTransparency ? 0.6 : 0.92,
                  }}
                >
                  <svg
                    viewBox="0 0 512 512"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                  >
                    <path
                      d="M302 132 L330 70 L354 148 Z"
                      fill="rgba(120,72,38,0.85)"
                    />
                    <path
                      d="M248 138 L214 78 L198 154 Z"
                      fill="rgba(120,72,38,0.85)"
                    />
                    <path
                      d="M305 144 L330 88 L345 152 Z"
                      fill="rgba(255,255,255,0.12)"
                    />
                    <path
                      d="M245 150 L214 96 L206 156 Z"
                      fill="rgba(255,255,255,0.12)"
                    />
                  </svg>
                </div>
              ) : null}
              {useSpritePack ? (
                <SpriteSheetDog
                  stage={lifeStageStage}
                  anim={spriteAnim}
                  facing={artFacing}
                  size={size}
                  reduceMotion={reduceMotion}
                  fallbackSrc={spriteSrc}
                  className="select-none"
                  onDebug={debugSprite ? setSpriteDebug : undefined}
                />
              ) : spriteSrc ? (
                <div
                  style={{
                    width: size,
                    height: size,
                    transformOrigin: "50% 100%",
                    transform: `scaleX(${artFacing})`,
                    animation: reduceMotion
                      ? "none"
                      : sleepActive
                        ? "dg-sprite-bob 3.6s ease-in-out infinite"
                        : intent === "play"
                          ? isMoving
                            ? "dg-walk 0.32s ease-in-out infinite"
                            : "dg-sprite-bob 1.3s ease-in-out infinite"
                          : isMoving
                            ? "dg-walk 0.48s ease-in-out infinite"
                            : "dg-sprite-bob 2.4s ease-in-out infinite",
                  }}
                >
                  <img
                    src={spriteSrc}
                    alt=""
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "contain",
                      imageRendering: "auto",
                      filter: reduceTransparency
                        ? "none"
                        : "drop-shadow(0 18px 40px rgba(0,0,0,0.35))",
                    }}
                  />
                </div>
              ) : null}

              {debugSprite ? (
                <div
                  className="pointer-events-none absolute left-2 top-2 z-30 max-w-[92%] rounded-2xl border border-white/15 bg-black/55 px-3 py-2 text-[11px] text-zinc-100 backdrop-blur"
                  style={{ lineHeight: 1.25 }}
                >
                  <div className="font-extrabold text-emerald-200">
                    Sprite debug
                  </div>

                  <div className="pointer-events-auto mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-zinc-100 hover:bg-black/40 transition"
                      onClick={async () => {
                        const lines = [];
                        lines.push("[Doggerz sprite debug]");
                        lines.push(
                          `BASE_URL: ${String(spriteChecks?.baseUrl || import.meta.env.BASE_URL || "/")}`
                        );
                        lines.push(
                          `SW controller: ${spriteChecks?.sw?.controller ? "yes" : "no"}`
                        );
                        lines.push(
                          `stage: ${String(lifeStageStage || "PUPPY")}`
                        );
                        lines.push(`anim: ${String(spriteAnim)}`);
                        lines.push(
                          `sheet: ${String(spriteDebug?.sheetSrc || "(none)")}`
                        );
                        lines.push(
                          `fallback: ${String(spriteDebug?.effectiveFallbackSrc || spriteSrc || "(none)")}`
                        );
                        lines.push(
                          `strip loaded: ${spriteDebug?.sheetLoaded ? "yes" : "no"}`
                        );
                        lines.push(
                          `strip failed: ${spriteDebug?.sheetFailed ? "yes" : "no"}`
                        );
                        if (
                          Array.isArray(spriteChecks?.results) &&
                          spriteChecks.results.length
                        ) {
                          lines.push("checks:");
                          for (const r of spriteChecks.results) {
                            const status = r.ok
                              ? `OK ${r.status}`
                              : `FAIL${r.status ? ` ${r.status}` : ""}`;
                            const extra = [
                              r.type ? `type=${r.type}` : null,
                              r.error ? `error=${r.error}` : null,
                            ]
                              .filter(Boolean)
                              .join(" ");
                            lines.push(
                              `- ${r.label}: ${status}${extra ? ` (${extra})` : ""}`
                            );
                            if (r.url) lines.push(`  ${r.url}`);
                          }
                        }

                        const text = lines.join("\n");
                        try {
                          await navigator.clipboard.writeText(text);
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1200);
                        } catch {
                          try {
                            window.prompt("Copy sprite debug:", text);
                          } catch {
                            // ignore
                          }
                        }
                      }}
                    >
                      {copied ? "Copied" : "Copy debug"}
                    </button>
                  </div>
                  <div className="mt-1 text-zinc-400">
                    BASE_URL:{" "}
                    <span className="font-semibold">
                      {String(
                        spriteChecks?.baseUrl || import.meta.env.BASE_URL || "/"
                      )}
                    </span>{" "}
                    · SW controller:{" "}
                    <span className="font-semibold">
                      {spriteChecks?.sw?.controller ? "yes" : "no"}
                    </span>
                  </div>
                  <div className="mt-1 text-zinc-200/90">
                    stage:{" "}
                    <span className="font-semibold">
                      {String(lifeStageStage || "PUPPY")}
                    </span>{" "}
                    · anim:{" "}
                    <span className="font-semibold">{String(spriteAnim)}</span>
                  </div>
                  <div className="mt-1 break-all text-zinc-300/90">
                    sheet: {spriteDebug?.sheetSrc || "(none)"}
                  </div>
                  <div className="mt-1 break-all text-zinc-400">
                    fallback:{" "}
                    {spriteDebug?.effectiveFallbackSrc || spriteSrc || "(none)"}
                  </div>
                  <div className="mt-1 text-zinc-400">
                    strip: {spriteDebug?.sheetLoaded ? "loaded" : "not loaded"}{" "}
                    / {spriteDebug?.sheetFailed ? "failed" : "ok"} · frames:{" "}
                    {spriteDebug?.frames ?? "?"} @ {spriteDebug?.fps ?? "?"}fps
                  </div>

                  {spriteChecks?.results?.length ? (
                    <div className="mt-2 space-y-1 text-zinc-300/90">
                      {spriteChecks.results.map((r) => (
                        <div key={r.label} className="break-all">
                          {r.label}:{" "}
                          <span className="font-semibold">
                            {r.ok
                              ? `OK ${r.status}`
                              : `FAIL${r.status ? ` ${r.status}` : ""}`}
                          </span>
                          {r.type ? (
                            <span className="text-zinc-400"> · {r.type}</span>
                          ) : null}
                          {r.error ? (
                            <span className="text-red-200"> · {r.error}</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          {/* Cosmetics should sit above the dog art (rig or sprite) */}
          <div className="absolute inset-0 z-20">
            <DogCosmeticsOverlay
              equipped={cosmeticsEquipped}
              size={size}
              facing={artFacing}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
