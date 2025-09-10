// src/components/UI/Splash.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import useJitteredTimer from "../../hooks/useJitteredTimer";
import usePageVisibility from "../../hooks/usePageVisibility";
import DogSprite from "./DogSprite";

import barkSfx from "../../assets/audio/bark1.mp3"; // <— add this file

export default function Splash() {
  const navigate = useNavigate();

  // simple focus index for buttons: 0 = Sign Up, 1 = Sign In
  const [focusIdx, setFocusIdx] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [isWagging, setIsWagging] = useState(true); // idle animation
  const audioRef = useRef(null);
  const hasInteractedRef = useRef(false); // to satisfy autoplay policies

  // bark + tiny jump
  const bark = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch {
      // ignore autoplay errors until user interacts
    }
    setJumping(true);
    setTimeout(() => setJumping(false), 350);
  }, []);

  // Random “idle” moments: tiny hops / barks
  useJitteredTimer({ baseMs: 2400, jitter: 0.35, autoStart: true });
  useEffect(() => {
    // every tick: ~20% chance to bark & hop if visible
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && Math.random() < 0.2) bark();
    }, 2400);
    return () => clearInterval(id);
  }, [bark]);

  // Pause wag when page hidden (saves CPU)
  usePageVisibility({
    onHide: () => setIsWagging(false),
    onShow: () => setIsWagging(true),
  });

  // Keyboard / gamepad shortcuts
  useKeyboardShortcuts(
    {
      // Navigate with arrows / A-D
      arrowleft: () => setFocusIdx((i) => Math.max(0, i - 1)),
      a: () => setFocusIdx((i) => Math.max(0, i - 1)),
      arrowright: () => setFocusIdx((i) => Math.min(1, i + 1)),
      d: () => setFocusIdx((i) => Math.min(1, i + 1)),

      // Bark / jump
      space: () => {
        hasInteractedRef.current = true;
        bark();
      },

      // Enter activates current selection
      enter: () => {
        hasInteractedRef.current = true;
        if (focusIdx === 0) navigate("/signup");
        else navigate("/login");
      },

      // Quick shortcuts
      s: () => navigate("/signup"),
      l: () => navigate("/login"),
    },
    { enabled: true, preventDefault: true }
  );

  // On first click/tap, “unlock” audio autoplay
  const primeAudio = () => {
    if (!hasInteractedRef.current && audioRef.current) {
      hasInteractedRef.current = true;
      audioRef.current.play().catch(() => {});
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // “Selected” button styles
  const btn = useMemo(
    () =>
      "px-6 py-3 rounded-2xl font-semibold transition-all shadow " +
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
    []
  );
  const selected = "bg-blue-600 text-white ring-blue-600 scale-105";
  const unselected = "bg-white text-blue-600 ring-blue-300 hover:scale-[1.02]";

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-blue-200 flex flex-col items-center justify-center"
      onMouseDown={primeAudio}
      onTouchStart={primeAudio}
    >
      <audio ref={audioRef} src={barkSfx} preload="auto" />

      {/* Logo / Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-blue-700 drop-shadow">
          Doggerz
        </h1>
        <p className="mt-2 text-blue-800/80">
          The most realistic virtual dog: train, potty, age, and bond. 🐾
        </p>
      </div>

      {/* Dog zone */}
      <div className="relative h-56 w-[min(92vw,640px)]">
        <div
          className={
            "absolute left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out" +
            (jumping ? " -translate-y-6" : " -translate-y-0")
          }
        >
          <DogSprite
            size={96}
            frameWidth={64}
            frameHeight={64}
            direction="right"
            isWalking={isWagging} // wag anim reads as light walk/run
            frameCount={4}
            frameRate={9}
          />
        </div>

        {/* Simple ground “shadow” */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/10 rounded-full blur-md" />
      </div>

      {/* CTA Buttons */}
      <div className="mt-10 flex gap-4">
        <Link
          to="/signup"
          className={`${btn} ${focusIdx === 0 ? selected : unselected}`}
          onMouseEnter={() => setFocusIdx(0)}
        >
          Sign Up
        </Link>

        <Link
          to="/login"
          className={`${btn} ${focusIdx === 1 ? selected : unselected}`}
          onMouseEnter={() => setFocusIdx(1)}
        >
          Sign In
        </Link>
      </div>

      <p className="mt-6 text-xs text-blue-900/60">
        Tip: ← → to switch • Enter to confirm • Space to bark
      </p>
    </div>
  );
}
