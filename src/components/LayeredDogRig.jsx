// src/components/LayeredDogRig.jsx
// A lightweight "rig" made of separate sprite layers.
// - Supports pose switching (stand/sit/lay)
// - Supports expressive micro-animations (blink, pant, wag, bark)
// - Uses safe fallbacks if rig assets aren't present
// @ts-nocheck

import * as React from "react";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function existsCacheKey(src) {
  return `dg:asset-ok:${src}`;
}

function useAssetOk(src) {
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    if (!src) return;
    if (typeof window === "undefined") return;

    try {
      const cached = window.sessionStorage.getItem(existsCacheKey(src));
      if (cached === "1") {
        setOk(true);
        return;
      }
    } catch {
      // ignore
    }

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      setOk(true);
      try {
        window.sessionStorage.setItem(existsCacheKey(src), "1");
      } catch {
        // ignore
      }
    };
    img.onerror = () => {
      if (cancelled) return;
      setOk(false);
      try {
        window.sessionStorage.setItem(existsCacheKey(src), "0");
      } catch {
        // ignore
      }
    };

    return () => {
      cancelled = true;
    };
  }, [src]);

  return ok;
}

function rigPath(name) { // eslint-disable-line no-unused-vars
  // Sprite assets have been removed
  return null;
}

export default function LayeredDogRig({
  fallbackSrc, // optional: existing full dog image
  size = 320,
  pose = "stand", // stand | sit | lay
  mood = "idle", // idle | curious | sleepy
  action = "idle", // idle | walk | eat | bark
  lifeStageStage, // optional: 'PUPPY' | 'ADULT' | 'SENIOR'
  reduceMotion = false,
  reduceTransparency = false,
  className = "",
}) {
  const s = clamp(size, 96, 512);

  const stageKey = String(lifeStageStage || "").toUpperCase();
  const stageScale = stageKey === "PUPPY" ? 0.92 : stageKey === "SENIOR" ? 0.99 : 1;
  const headScale = stageKey === "PUPPY" ? 1.07 : 1;

  const bodyName =
    pose === "sit" ? "body-sit.svg" : pose === "lay" ? "body-lay.svg" : "body-stand.svg";

  // When walking in stand pose, we can render a leg-less body + animated leg layers.
  const useLayeredLegs = pose === "stand" && action === "walk";
  const bodyStandCoreSrc = rigPath("body-stand-core.svg");
  const legFrontSrc = rigPath("leg-front.svg");
  const legMidSrc = rigPath("leg-mid.svg");
  const legBackSrc = rigPath("leg-back.svg");

  const bodySrc = rigPath(bodyName);
  const headSrc = rigPath("head.svg");
  const tailSrc = rigPath("tail.svg");
  const eyesOpenSrc = rigPath("eyes-open.svg");
  const eyesClosedSrc = rigPath("eyes-closed.svg");
  const mouthClosedSrc = rigPath("mouth-closed.svg");
  const mouthOpenSrc = rigPath("mouth-open.svg");
  const tongueSrc = rigPath("tongue.svg");
  const bowlSrc = rigPath("bowl.svg");

  // If the rig isn't present (first asset missing), fall back to the full sprite.
  // For layered legs, body-stand-core is the critical asset.
  const rigAvailable = useAssetOk(useLayeredLegs ? bodyStandCoreSrc : bodySrc);

  const [blink, setBlink] = React.useState(false);

  React.useEffect(() => {
    if (reduceMotion) return;
    // Simple blink timing.
    let mounted = true;
    let t;

    const schedule = () => {
      const ms = 2200 + Math.random() * 2600;
      t = window.setTimeout(() => {
        if (!mounted) return;
        setBlink(true);
        window.setTimeout(() => mounted && setBlink(false), 120);
        schedule();
      }, ms);
    };

    schedule();
    return () => {
      mounted = false;
      if (t) window.clearTimeout(t);
    };
  }, [reduceMotion]);

  if (!rigAvailable) {
    // Fallback to a single image (still animates container subtly).
    return (
      <div
        className={className}
        style={{
          width: s,
          height: s,
          position: "relative",
          transformOrigin: "50% 100%",
          animation: reduceMotion
            ? "none"
            : mood === "sleepy"
              ? "dg-rig-breathe 3.6s ease-in-out infinite"
              : action === "walk"
                ? "dg-rig-breathe 1.25s ease-in-out infinite"
                : "dg-rig-breathe 2.4s ease-in-out infinite",
        }}
        aria-hidden="true"
      >
        <style>{`
          @keyframes dg-rig-breathe {
            0% { transform: translate3d(0,0,0) scale(1); }
            50% { transform: translate3d(0,-2px,0) scale(1.01); }
            100% { transform: translate3d(0,0,0) scale(1); }
          }
        `}</style>
        {fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        ) : null}
      </div>
    );
  }

  const isSleeping = mood === "sleepy" || pose === "lay" && action === "idle";
  const isPanting = !isSleeping && (mood === "curious" || action === "walk");
  const isBarking = action === "bark";
  const isEating = action === "eat";

  const showEyesClosed = isSleeping || blink;
  const showMouthOpen = isBarking || isPanting || isEating;

  const wagSpeed = reduceMotion ? "0ms" : isBarking ? "210ms" : isPanting ? "300ms" : "460ms";
  // Tail amplitude via wrapper scale so it doesn't fight the keyframed rotate() transform.
  const wagAmp = reduceMotion ? 1 : isBarking ? 1.25 : isPanting ? 1.1 : 1;

  return (
    <div
      className={className}
      style={{
        width: s,
        height: s,
        position: "relative",
        transformOrigin: "50% 100%",
        transform: stageScale !== 1 ? `scale(${stageScale})` : undefined,
        filter: reduceTransparency ? "none" : "drop-shadow(0 18px 40px rgba(0,0,0,0.35))",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes dg-rig-breathe {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-2px,0) scale(1.01); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes dg-rig-wag {
          0% { transform: rotate(-16deg); }
          50% { transform: rotate(16deg); }
          100% { transform: rotate(-16deg); }
        }
        @keyframes dg-rig-head-tilt {
          0% { transform: translate3d(0,0,0) rotate(0deg); }
          35% { transform: translate3d(0,-1px,0) rotate(-6deg); }
          70% { transform: translate3d(0,0,0) rotate(5deg); }
          100% { transform: translate3d(0,0,0) rotate(0deg); }
        }
        @keyframes dg-rig-head-sleep {
          0% { transform: translate3d(0,0,0) rotate(-1deg); }
          50% { transform: translate3d(0,1px,0) rotate(1deg); }
          100% { transform: translate3d(0,0,0) rotate(-1deg); }
        }
        @keyframes dg-rig-leg-front {
          0% { transform: rotate(18deg) translate3d(0,0,0); }
          50% { transform: rotate(-18deg) translate3d(0,0,0); }
          100% { transform: rotate(18deg) translate3d(0,0,0); }
        }
        @keyframes dg-rig-leg-back {
          0% { transform: rotate(-14deg) translate3d(0,0,0); }
          50% { transform: rotate(14deg) translate3d(0,0,0); }
          100% { transform: rotate(-14deg) translate3d(0,0,0); }
        }
        @keyframes dg-rig-pant {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,1.5px,0); }
          100% { transform: translate3d(0,0,0); }
        }
        @keyframes dg-rig-bark {
          0% { transform: scale(1); }
          45% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes dg-rig-walkbob {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-3px,0); }
          100% { transform: translate3d(0,0,0); }
        }
      `}</style>

      {/* Body breath/bob */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: reduceMotion
            ? "none"
            : isSleeping
              ? "dg-rig-breathe 3.8s ease-in-out infinite"
              : action === "walk"
                ? "dg-rig-walkbob 0.9s ease-in-out infinite"
                : "dg-rig-breathe 2.4s ease-in-out infinite",
        }}
      >
        {/* Layered legs for a true walk cycle (only when walking + standing) */}
        {useLayeredLegs ? (
          <>
            {/* Back leg (behind body) */}
            <img
              src={legBackSrc}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transformOrigin: "66% 70%",
                animation: reduceMotion ? "none" : "dg-rig-leg-back 560ms ease-in-out infinite",
                opacity: 0.96,
              }}
            />

            {/* Mid leg (slightly behind the front leg) */}
            <img
              src={legMidSrc}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transformOrigin: "56% 70%",
                animation: reduceMotion ? "none" : "dg-rig-leg-back 560ms ease-in-out infinite",
                animationDelay: reduceMotion ? undefined : "-280ms",
                opacity: 0.9,
              }}
            />

            {/* Front leg */}
            <img
              src={legFrontSrc}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                transformOrigin: "38% 70%",
                animation: reduceMotion ? "none" : "dg-rig-leg-front 560ms ease-in-out infinite",
                animationDelay: reduceMotion ? undefined : "-280ms",
                opacity: 0.98,
              }}
            />
          </>
        ) : null}

        {/* Body */}
        <img
          src={useLayeredLegs ? bodyStandCoreSrc : bodySrc}
          alt=""
          draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {/* Tail */}
        <div
          style={{
            position: "absolute",
            left: "18%",
            top: pose === "lay" ? "54%" : pose === "sit" ? "48%" : "46%",
            width: "26%",
            height: "26%",
            transform: wagAmp !== 1 ? `scale(${wagAmp})` : undefined,
          }}
        >
          <img
            src={tailSrc}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              transformOrigin: "85% 25%",
              animation:
                reduceMotion || isSleeping ? "none" : `dg-rig-wag ${wagSpeed} ease-in-out infinite`,
              opacity: 0.98,
            }}
          />
        </div>

        {/* Head */}
        <img
          src={headSrc}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: pose === "lay" ? "46%" : "50%",
            top: pose === "lay" ? "26%" : pose === "sit" ? "18%" : "14%",
            width: "48%",
            height: "48%",
            transform: `translate(-50%, 0)${headScale !== 1 ? ` scale(${headScale})` : ""}`,
            transformOrigin: "50% 70%",
            animation: reduceMotion
              ? "none"
              : isSleeping
                ? "dg-rig-head-sleep 3.2s ease-in-out infinite"
                : mood === "curious"
                  ? "dg-rig-head-tilt 2.1s ease-in-out infinite"
                  : action === "walk"
                    ? "dg-rig-breathe 1.35s ease-in-out infinite"
                    : "dg-rig-breathe 2.6s ease-in-out infinite",
          }}
        />

        {/* Subtle head highlight for a more "real" feel */}
        <div
          style={{
            position: "absolute",
            left: pose === "lay" ? "56%" : "60%",
            top: pose === "lay" ? "44%" : pose === "sit" ? "36%" : "32%",
            width: "30%",
            height: "26%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle at 45% 55%, rgba(240,240,240,0.75), rgba(240,240,240,0.0) 68%)",
            mixBlendMode: "screen",
            opacity: reduceTransparency ? 0.12 : isSleeping ? 0.18 : 0.55,
            pointerEvents: "none",
          }}
        />

        {/* Eyes */}
        <img
          src={showEyesClosed ? eyesClosedSrc : eyesOpenSrc}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: pose === "lay" ? "54%" : "58%",
            top: pose === "lay" ? "38%" : pose === "sit" ? "30%" : "26%",
            width: "18%",
            height: "18%",
            transform: "translate(-50%, -50%)",
            opacity: reduceTransparency ? 0.8 : 0.95,
          }}
        />

        {/* Mouth */}
        <div
          style={{
            position: "absolute",
            left: pose === "lay" ? "56%" : "60%",
            top: pose === "lay" ? "46%" : pose === "sit" ? "38%" : "34%",
            width: "22%",
            height: "22%",
            transform: "translate(-50%, -50%)",
            transformOrigin: "50% 50%",
            animation: reduceMotion
              ? "none"
              : isBarking
                ? "dg-rig-bark 320ms ease-in-out infinite"
                : isPanting || isEating
                  ? "dg-rig-pant 220ms ease-in-out infinite"
                  : "none",
          }}
        >
          <img
            src={showMouthOpen ? mouthOpenSrc : mouthClosedSrc}
            alt=""
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          />
          {showMouthOpen && !isBarking && !isSleeping ? (
            <img
              src={tongueSrc}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: "44%",
                top: "56%",
                width: "42%",
                height: "42%",
                transform: "translate(-50%, -50%)",
                opacity: reduceTransparency ? 0.65 : 0.8,
              }}
            />
          ) : null}
        </div>

        {/* Food bowl for eating */}
        {isEating ? (
          <img
            src={bowlSrc}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: "66%",
              top: pose === "lay" ? "70%" : "72%",
              width: "20%",
              height: "20%",
              transform: "translate(-50%, -50%)",
              opacity: reduceTransparency ? 0.55 : 0.75,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
