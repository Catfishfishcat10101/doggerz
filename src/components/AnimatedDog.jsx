// src/components/AnimatedDog.jsx
// @ts-nocheck

import React, { useEffect, useMemo, useRef, useState } from "react";
import DogSpriteAnimator from "@/components/DogSpriteAnimator.jsx";

/**
 * AnimatedDog
 * - Uses your 9x9 spritesheet animator (idle frames 0..7)
 * - Adds "alive" motion (breathing + bob)
 * - Adds random micro-actions (blink squash, twitch)
 * - Adds action-specific reactions (feed/play/bathe/potty)
 *
 * NOTE: No special frames required. Reactions are transform-based and immediate.
 */
export default function AnimatedDog({
  src,
  cols = 9,
  rows = 9,
  fps = 8,
  scale = 2.6,
  pixelated = false,
  className = "",
  mood = "neutral",
  // When this changes, triggers a small generic pulse (optional)
  pulseKey = "",
  // Action reaction system:
  // action: "feed" | "play" | "bathe" | "potty" | "train" | ""
  action = "",
  // actionKey should change each time you want a reaction (recommended)
  actionKey = "",
}) {
  const [blinkOn, setBlinkOn] = useState(false);
  const [twitchOn, setTwitchOn] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);

  const [reactClass, setReactClass] = useState("");

  const blinkTimer = useRef(null);
  const twitchTimer = useRef(null);
  const pulseTimer = useRef(null);
  const reactTimer = useRef(null);

  const moodTuning = useMemo(() => {
    let bobAmp = 1.0;
    let breatheAmp = 1.0;
    let speed = 1.0;

    const m = (mood || "neutral").toLowerCase();
    if (m === "happy") {
      bobAmp = 1.25;
      breatheAmp = 1.1;
      speed = 1.05;
    } else if (m === "sleepy") {
      bobAmp = 0.75;
      breatheAmp = 0.9;
      speed = 0.85;
    } else if (m === "hungry") {
      bobAmp = 1.05;
      breatheAmp = 1.0;
      speed = 0.95;
    } else if (m === "dirty") {
      bobAmp = 0.9;
      breatheAmp = 0.95;
      speed = 0.9;
    }

    return { bobAmp, breatheAmp, speed };
  }, [mood]);

  // Random blink loop
  useEffect(() => {
    const scheduleBlink = () => {
      const min = 5500;
      const max = 9500;
      const wait = Math.floor(min + Math.random() * (max - min));

      blinkTimer.current = window.setTimeout(() => {
        setBlinkOn(true);
        window.setTimeout(() => setBlinkOn(false), 120);
        scheduleBlink();
      }, wait);
    };

    scheduleBlink();
    return () => window.clearTimeout(blinkTimer.current);
  }, []);

  // Random twitch loop
  useEffect(() => {
    const scheduleTwitch = () => {
      const min = 6500;
      const max = 13000;
      const wait = Math.floor(min + Math.random() * (max - min));

      twitchTimer.current = window.setTimeout(() => {
        setTwitchOn(true);
        window.setTimeout(() => setTwitchOn(false), 220);
        scheduleTwitch();
      }, wait);
    };

    scheduleTwitch();
    return () => window.clearTimeout(twitchTimer.current);
  }, []);

  // Generic pulse when pulseKey changes
  useEffect(() => {
    if (!pulseKey) return;

    setPulseOn(true);
    window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulseOn(false), 260);

    return () => window.clearTimeout(pulseTimer.current);
  }, [pulseKey]);

  // Action-specific reaction when actionKey changes (preferred) OR action changes
  useEffect(() => {
    const a = (action || "").toLowerCase();
    if (!a) return;

    let cls = "";
    let dur = 600;

    if (a === "feed") {
      cls = "dog-react-feed";
      dur = 620;
    } else if (a === "play") {
      cls = "dog-react-play";
      dur = 850;
    } else if (a === "bathe") {
      cls = "dog-react-bathe";
      dur = 900;
    } else if (a === "potty") {
      cls = "dog-react-potty";
      dur = 780;
    } else if (a === "train") {
      cls = "dog-react-train";
      dur = 820;
    } else {
      cls = "dog-react-pulse";
      dur = 520;
    }

    window.clearTimeout(reactTimer.current);
    setReactClass(cls);
    reactTimer.current = window.setTimeout(() => setReactClass(""), dur);

    return () => window.clearTimeout(reactTimer.current);
  }, [actionKey, action]);

  const styleVars = useMemo(() => {
    const { bobAmp, breatheAmp, speed } = moodTuning;

    const bobPx = 6 * bobAmp;
    const breatheScale = 0.012 * breatheAmp;
    const durBob = 3.8 / speed;
    const durBreathe = 4.6 / speed;

    return {
      "--dog-bob": `${bobPx}px`,
      "--dog-breathe": `${breatheScale}`,
      "--dog-bob-dur": `${durBob}s`,
      "--dog-breathe-dur": `${durBreathe}s`,
    };
  }, [moodTuning]);

  const idleSeq = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7], []);

  return (
    <div className={`dog-alive-root ${className}`} style={styleVars}>
      <style>{`
        .dog-alive-root {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 18px 40px rgba(0,0,0,0.45));
        }

        .dog-alive-wrap {
          display: inline-block;
          transform-origin: 50% 80%;
          animation:
            dogBob var(--dog-bob-dur) ease-in-out infinite,
            dogBreathe var(--dog-breathe-dur) ease-in-out infinite;
          will-change: transform;
        }

        .dog-blink { animation: dogBlink 120ms ease-out 1; }
        .dog-twitch { animation: dogTwitch 220ms ease-out 1; }
        .dog-pulse { animation: dogPulse 260ms ease-out 1; }

        /* Action reactions */
        .dog-react-feed { animation: dogFeed 620ms cubic-bezier(.2,.9,.2,1) 1; }
        .dog-react-play { animation: dogPlay 850ms cubic-bezier(.2,.9,.2,1) 1; }
        .dog-react-bathe { animation: dogBathe 900ms ease-out 1; }
        .dog-react-potty { animation: dogPotty 780ms cubic-bezier(.2,.9,.2,1) 1; }
        .dog-react-train { animation: dogTrain 820ms cubic-bezier(.2,.9,.2,1) 1; }
        .dog-react-pulse { animation: dogPulse 520ms ease-out 1; }

        @keyframes dogBob {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(calc(var(--dog-bob) * -1)); }
          100% { transform: translateY(0px); }
        }

        @keyframes dogBreathe {
          0%   { transform: scale(1); }
          45%  { transform: scale(calc(1 + var(--dog-breathe))); }
          100% { transform: scale(1); }
        }

        @keyframes dogBlink {
          0%   { transform: scaleY(1); }
          40%  { transform: scaleY(0.92); }
          100% { transform: scaleY(1); }
        }

        @keyframes dogTwitch {
          0%   { transform: rotate(0deg); }
          35%  { transform: rotate(-2.2deg); }
          70%  { transform: rotate(1.6deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes dogPulse {
          0%   { transform: translateY(0) scale(1); }
          40%  { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }

        /* Feed: happy hop + settle */
        @keyframes dogFeed {
          0%   { transform: translateY(0) scale(1); }
          30%  { transform: translateY(-10px) scale(1.03); }
          55%  { transform: translateY(0) scale(0.99); }
          100% { transform: translateY(0) scale(1); }
        }

        /* Play: more energetic bounce */
        @keyframes dogPlay {
          0%   { transform: translateY(0) scale(1); }
          18%  { transform: translateY(-12px) scale(1.03); }
          36%  { transform: translateY(0) scale(0.99); }
          55%  { transform: translateY(-9px) scale(1.02); }
          72%  { transform: translateY(0) scale(1); }
          100% { transform: translateY(0) scale(1); }
        }

        /* Bathe: shake-off wobble */
        @keyframes dogBathe {
          0%   { transform: rotate(0deg) scale(1); }
          12%  { transform: rotate(-4deg) scale(1.01); }
          24%  { transform: rotate(4deg) scale(1.01); }
          36%  { transform: rotate(-4deg) scale(1.01); }
          48%  { transform: rotate(4deg) scale(1.01); }
          60%  { transform: rotate(-2deg) scale(1); }
          80%  { transform: rotate(1deg) scale(1); }
          100% { transform: rotate(0deg) scale(1); }
        }

        /* Potty: quick squat (down) + stand */
        @keyframes dogPotty {
          0%   { transform: translateY(0) scale(1); }
          25%  { transform: translateY(10px) scale(0.98); }
          55%  { transform: translateY(10px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }

        /* Train: attentive lean-in */
        @keyframes dogTrain {
          0%   { transform: translateY(0) scale(1) rotate(0deg); }
          35%  { transform: translateY(-6px) scale(1.02) rotate(-1.5deg); }
          70%  { transform: translateY(-3px) scale(1.01) rotate(1deg); }
          100% { transform: translateY(0) scale(1) rotate(0deg); }
        }
      `}</style>

      <div
        className={[
          "dog-alive-wrap",
          blinkOn ? "dog-blink" : "",
          twitchOn ? "dog-twitch" : "",
          pulseOn ? "dog-pulse" : "",
          reactClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <DogSpriteAnimator
          src={src}
          cols={cols}
          rows={rows}
          fps={fps}
          sequence={idleSeq}
          scale={scale}
          pixelated={pixelated}
        />
      </div>
    </div>
  );
}
