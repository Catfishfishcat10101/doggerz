// src/components/UI/Splash.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ⬇️ Adjust these two imports to match your actual files exactly (case-sensitive).
// If your file is DogSprite.js, drop the .jsx or change to .js accordingly.
import DogSprite from "../../features/DogSprite.jsx"; // <-- (check filename/case)
import bg from "../../assets/backgrounds/yard_day.jpg"; // <-- (check path exists)

// Optional ambience: if you have a SoundManager util, import and use it here.
// Otherwise this component will fall back to a plain <audio> tag.
// import SoundManager from "../../features/SoundManager.js"; // <-- (check filename/case)

export default function Splash() {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [starting, setStarting] = useState(false);
  const audioRef = useRef(null);

  // Attempt to autoplay quietly (muted true satisfies most browsers).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.35;
    a.muted = muted;
    // Best-effort play; ignore failures (mobile requires user gesture).
    const tryPlay = async () => {
      try {
        await a.play();
      } catch {
        // Autoplay likely blocked — we'll start on user interaction.
      }
    };
    tryPlay();
  }, [muted]);

  // Keyboard: allow Enter/Space to start
  useEffect(() => {
    const onKey = (e) => {
      if (starting) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [starting]);

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);

    // Try a little “click” by briefly unmuting if user allows sound
    const a = audioRef.current;
    if (a && !muted) {
      try {
        a.currentTime = Math.min(a.duration - 0.25, a.currentTime);
        await a.play();
      } catch {
        /* ignore */
      }
    }

    // Small delay for button animation, then navigate.
    setTimeout(() => {
      // TODO: update this path to the first in-app route you actually use.
      // e.g. "/home", "/game", or whatever your router defines.
      navigate("/home", { replace: true });
    }, 260);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(7,12,20,0.55), rgba(7,12,20,0.8)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Ambient loop (safe to remove if you don't want audio) */}
      <audio
        ref={audioRef}
        src="/sfx/ambience_garden.mp3" // Optional: place file under /public/sfx/ or import from assets
        loop
        preload="auto"
      />

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 md:p-6">
        <h1 className="pointer-events-auto select-none text-xl font-semibold tracking-wide drop-shadow md:text-2xl">
          Doggerz
        </h1>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-lg bg-black/30 px-3 py-1.5 text-sm backdrop-blur transition hover:bg-black/40"
            aria-pressed={muted ? "true" : "false"}
            title={muted ? "Unmute ambience" : "Mute ambience"}
          >
            {muted ? "🔇 Muted" : "🔊 Sound On"}
          </button>
        </div>
      </header>

      {/* Center stage */}
      <main className="relative z-10 mx-auto mt-28 flex max-w-3xl flex-col items-center px-4 text-center md:mt-36">
        {/* Hero copy */}
        <div className="mb-6 md:mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-white/80">
            Virtual Pup • Cozy Care • Mini-Adventures
          </p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight drop-shadow md:text-6xl">
            Raise. Play. <span className="text-amber-300">Bond.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-balance text-white/80 md:text-lg">
            Your companion is waiting. Build routines, learn tricks, explore
            seasons, and unlock stories—one belly rub at a time.
          </p>
        </div>

        {/* Dog sprite showcase */}
        <div className="relative mb-8 h-48 w-full md:h-56">
          <div className="absolute inset-0 mx-auto flex max-w-md items-center justify-center">
            {/* If DogSprite throws, the whole page would error; wrap in a tiny guard */}
            <SafeSprite />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStart}
            disabled={starting}
            className={[
              "group inline-flex items-center gap-3 rounded-2xl px-6 py-3 md:px-8 md:py-4",
              "bg-amber-500 text-black font-semibold shadow-lg shadow-black/30",
              "transition-transform hover:scale-[1.02] active:scale-[0.99]",
              starting ? "opacity-70 cursor-wait" : "",
            ].join(" ")}
          >
            {starting ? "Loading…" : "Press Enter to Start"}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
          <p className="text-xs text-white/70">or press Space / Enter</p>
        </div>
      </main>

      {/* Subtle vignette and noise overlay for style */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background:repeating-linear-gradient(0deg,transparent,transparent_2px,white_3px,transparent_4px)]" />
    </div>
  );
}

/**
 * Renders the dog sprite but guards against runtime errors so Splash never
 * collapses to a blank screen if DogSprite throws for any reason.
 */
function SafeSprite() {
  const [err, setErr] = useState(null);

  if (err) {
    return (
      <div className="rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white/80 backdrop-blur">
        Couldn’t render sprite. (Check <code>DogSprite</code>.)
      </div>
    );
  }
  return (
    <ErrorCatcher onError={setErr}>
      <DogSprite idle animation="breath" className="scale-110 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />
    </ErrorCatcher>
  );
}

function ErrorCatcher({ children, onError }) {
  const [hasErr, setHasErr] = useState(false);
  // simple boundary for function components
  if (hasErr) return null;
  try {
    return children;
  } catch (e) {
    console.error("[Splash:DogSprite error]", e);
    onError?.(e);
    setHasErr(true);
    return null;
  }
}