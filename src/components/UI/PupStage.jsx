import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDog,
  moveBy,
  startMoving,
  stopMoving,
  bark,
} from "@/redux/dogSlice";
import useGameTick from "@/hooks/useGameTick";

/**
 * PupStage
 * - interactive=true => WASD/Arrows move, click/Space/Enter bark
 * - NO tooltips
 * - Renders an SVG “PixelDog” with simple walk/bark animation
 */
export default function PupStage({ interactive = true, className = "" }) {
  const d = useSelector(selectDog);
  const dispatch = useDispatch();
  const [keys, setKeys] = useState({});
  const [sound, setSound] = useState(null); // optional bark sfx
  useGameTick(true);

  // Keyboard input (interactive only)
  useEffect(() => {
    if (!interactive) return;

    const onDown = (e) => {
      const k = normalizeKey(e.key);
      if (!k) return;
      if (k === "bark") {
        triggerBark();
        return;
      }
      setKeys((s) => (s[k] ? s : { ...s, [k]: 1 }));
      dispatch(startMoving());
    };
    const onUp = (e) => {
      const k = normalizeKey(e.key);
      if (!k) return;
      setKeys((s) => {
        const n = { ...s };
        delete n[k];
        return n;
      });
      queueMicrotask(() => {
        if (Object.keys(keys).length <= 1) dispatch(stopMoving());
      });
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, keys]);

  // Movement loop (interactive only)
  useEffect(() => {
    if (!interactive) return;
    let raf = 0;
    const speed = 180; // px/s
    const step = () => {
      const dt = 1 / 60;
      let dx = 0;
      if (keys.left) dx -= speed * dt;
      if (keys.right) dx += speed * dt;
      if (dx !== 0) dispatch(moveBy({ dx }));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [interactive, keys, dispatch]);

  const triggerBark = async () => {
    dispatch(bark());
    try {
      if (!sound) {
        const { Howl } = await import("howler");
        const s = new Howl({ src: ["/sfx/bark.mp3"], volume: 0.35, html5: true });
        setSound(s);
        s.play();
      } else {
        sound.play();
      }
    } catch { /* ignore if asset missing */ }
  };

  return (
    <div
      onClick={triggerBark}
      className={[
        "relative w-full min-h-[360px] rounded-2xl border border-white/10",
        "bg-gradient-to-b from-slate-900/60 to-slate-900/30 overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Ground */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none" />

      {/* Dog */}
      <div
        className="absolute bottom-16 will-change-transform"
        style={{
          transform: `translateX(${d.pos.x}px) scaleX(${d.dir === "left" ? -1 : 1})`,
        }}
      >
        <PixelDog mood={d.mood} moving={d.moving} />
      </div>

      {/* HUD (compact, no tooltips) */}
      <div className="absolute left-4 top-4 space-y-1 text-xs">
        <Stat label="Hunger" value={d.hunger} />
        <Stat label="Energy" value={d.energy} />
        <Stat label="Clean"  value={d.cleanliness} />
        <Stat label="Happy"  value={d.happiness} />
      </div>
    </div>
  );
}

/* ---------- tiny inline SVG dog with simple animations ---------- */
function PixelDog({ mood, moving }) {
  // jitter/bounce when walking; head bob on bark
  const walk = moving && (mood === "walk" || mood === "play");
  const bark = mood === "bark";

  return (
    <svg
      width="120" height="96" viewBox="0 0 120 96" aria-hidden="true"
      className={[
        walk ? "animate-[dogWalk_400ms_steps(2)_infinite]" : "",
        bark ? "animate-[dogBark_240ms_ease-in-out_1]" : "",
      ].join(" ")}
    >
      <defs>
        <style>{`
          @keyframes dogWalk {
            0% { transform: translateY(0) }
            50% { transform: translateY(-2px) }
            100% { transform: translateY(0) }
          }
          @keyframes dogBark {
            0% { transform: translateY(0) }
            25% { transform: translateY(-4px) }
            100% { transform: translateY(0) }
          }
          .s { paint-order: stroke; stroke:#0b0d16; stroke-width:2; }
        `}</style>
      </defs>

      {/* Body */}
      <rect x="18" y="34" rx="10" ry="10" width="72" height="40" className="s fill-amber-300" />
      {/* Tail */}
      <path d="M92 42 q14 6 0 14" className="s fill-none">
        <animate
          attributeName="d"
          dur="0.6s"
          repeatCount="indefinite"
          values="
            M92 42 q14 6 0 14;
            M92 42 q12 10 0 14;
            M92 42 q14 6 0 14
          "
        />
      </path>
      {/* Legs */}
      <rect x="26" y="70" width="10" height="14" className="s fill-amber-300" />
      <rect x="44" y="70" width="10" height="14" className="s fill-amber-300" />
      <rect x="62" y="70" width="10" height="14" className="s fill-amber-300" />
      <rect x="80" y="70" width="10" height="14" className="s fill-amber-300" />

      {/* Head */}
      <g transform="translate(6, 14)">
        <rect x="12" y="6" width="40" height="32" rx="8" className="s fill-amber-200" />
        {/* Ears */}
        <rect x="10" y="2" width="12" height="14" rx="4" className="s fill-rose-300" />
        <rect x="40" y="2" width="12" height="14" rx="4" className="s fill-rose-300" />
        {/* Eyes */}
        <circle cx="24" cy="20" r="3" className="fill-slate-900" />
        <circle cx="40" cy="20" r="3" className="fill-slate-900" />
        {/* Nose */}
        <rect x="30" y="24" width="4" height="3" rx="1" className="fill-slate-900" />
        {/* Tongue */}
        <path d="M32 28 q4 6 0 10 q-4 -4 0 -10" className="fill-pink-500" />
      </g>
    </svg>
  );
}

function Stat({ label, value }) {
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-slate-300">{label}</span>
      <div className="w-40 h-2 rounded bg-white/10 overflow-hidden">
        <div className="h-full bg-amber-400" style={{ width: `${v}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums text-slate-300">{Math.round(v)}</span>
    </div>
  );
}

function normalizeKey(k) {
  k = (k || "").toLowerCase();
  if (k === "a" || k === "arrowleft") return "left";
  if (k === "d" || k === "arrowright") return "right";
  if (k === " " || k === "enter") return "bark";
  return null;
}
