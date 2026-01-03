import { useEffect, useMemo, useRef, useState } from "react";

const STAGE_TO_SRC = {
  puppy: "/assets/dogs/realistic/dog.svg",
  pup: "/assets/dogs/realistic/dog.svg",
  adult: "/assets/dogs/realistic/dog.svg",
  senior: "/assets/dogs/realistic/dog.svg",
};

function normalizeStage(stageLike) {
  const s = String(stageLike || "adult").trim().toLowerCase();
  if (s.startsWith("pup") || s.includes("puppy")) return "puppy";
  if (s.startsWith("sen") || s.includes("senior")) return "senior";
  return "adult";
}

export default function RealisticDog({
  stage = "adult",
  src: srcOverride,
  size = 320,          // px
  alt = "Doggerz dog",
  className = "",
  style = {},
  onLoadError,
  onLoadSuccess,
}) {
  const [errored, setErrored] = useState(false);
  const [blinkOn, setBlinkOn] = useState(false);
  const [twitchOn, setTwitchOn] = useState(false);
  const [tiltOn, setTiltOn] = useState(false);

  const mountedRef = useRef(true);
  const timersRef = useRef([]);

  const src = useMemo(() => {
    if (srcOverride) return String(srcOverride);
    const normalizedStage = normalizeStage(stage);
    return STAGE_TO_SRC[normalizedStage] || STAGE_TO_SRC.adult;
  }, [srcOverride, stage]);

  // If the stage/src changes, allow another load attempt.
  useEffect(() => {
    setErrored(false);
  }, [src]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // clear any pending timers
      for (const t of timersRef.current) {
        try {
          clearTimeout(t);
        } catch {
          // ignore
        }
      }
      timersRef.current = [];
    };
  }, []);

  // Micro-animations: blink / twitch / slight head tilt.
  // Respect reduced motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (errored) return;

    let reduce = false;
    try {
      reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      reduce = false;
    }
    if (reduce) return;

    const schedule = (fn, ms) => {
      const id = window.setTimeout(() => {
        try {
          fn();
        } catch {
          // ignore
        }
      }, ms);
      timersRef.current.push(id);
      return id;
    };

    const rand = (min, max) =>
      Math.floor(min + Math.random() * (max - min + 1));

    const runBlink = () => {
      if (!mountedRef.current) return;
      setBlinkOn(true);
      schedule(() => mountedRef.current && setBlinkOn(false), rand(90, 140));
      // Next blink 2.5s–6.5s
      schedule(runBlink, rand(2500, 6500));
    };

    const runTwitch = () => {
      if (!mountedRef.current) return;
      setTwitchOn(true);
      schedule(() => mountedRef.current && setTwitchOn(false), rand(220, 340));
      // Next twitch 4s–9s
      schedule(runTwitch, rand(4000, 9000));
    };

    const runTilt = () => {
      if (!mountedRef.current) return;
      setTiltOn(true);
      schedule(() => mountedRef.current && setTiltOn(false), rand(520, 820));
      // Next tilt 6s–12s
      schedule(runTilt, rand(6000, 12000));
    };

    // Kick them off with small random offsets
    schedule(runBlink, rand(700, 1600));
    schedule(runTwitch, rand(1500, 2600));
    schedule(runTilt, rand(2200, 3800));

    return () => {
      // timers cleared by unmount effect
    };
  }, [errored, src]);

  return (
    <div
      className={`relative select-none dog-realistic-root ${className}`}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        ...style,
      }}
    >
      {/* Ground shadow */}
      <div
        className="absolute bottom-[14%] left-1/2 -translate-x-1/2 dog-shadow"
        aria-hidden="true"
      />

      {/* Dog image */}
      {!errored ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={[
            "dog-idle",
            "dog-realistic-img",
            blinkOn ? "dog-blink" : "",
            twitchOn ? "dog-twitch" : "",
            tiltOn ? "dog-tilt" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onLoad={(e) => {
            try {
              onLoadSuccess?.(e);
            } catch {
              // ignore
            }
          }}
          onError={(e) => {
            // Avoid infinite loops if the browser retries.
            if (errored) return;
            setErrored(true);
            try {
              onLoadError?.(e);
            } catch {
              // ignore
            }
          }}
          style={{
            width: "92%",
            height: "92%",
            objectFit: "contain",
            imageRendering: "auto",
            transformOrigin: "50% 70%",
            filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))",
          }}
        />
      ) : (
        <div
          className="text-xs text-zinc-400 text-center px-4"
          style={{ width: "92%" }}
        >
          Realistic dog image missing.
        </div>
      )}
    </div>
  );
}
