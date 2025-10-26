// src/components/Features/Affection.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { grantCoins } from "@/redux/dogSlice.js";
import SoundManager from "./SoundManager";

/**
 * Affection
 * - Tap or press/hold to pet the dog.
 * - Every 5 pets → +1 coin (with animated feedback).
 * - Throttled to avoid audio spam + accidental macros.
 * - A11y: keyboard operable, live region for coin gains.
 */
export default function Affection() {
  const dispatch = useDispatch();

  // UI state
  const [pets, setPets] = useState(0); // total pets this session/view
  const [streak, setStreak] = useState(0); // visual mini-combo meter (0..4 then reset)
  const [coinFlash, setCoinFlash] = useState(false); // transient “+1 coin!” signal
  const liveRegionRef = useRef(null);

  // Refs for non-reactive timing/hold state
  const repeatTimer = useRef(null);
  const lastPetAt = useRef(0);

  // CONFIG: adjust feel here
  const PET_THROTTLE_MS = 120; // minimum interval between pets
  const HOLD_START_DELAY = 260; // delay before auto-repeat kicks in
  const HOLD_REPEAT_MS = 110; // interval while holding (will be clamped by throttle)
  const MAX_HOLD_PETS_PER_PRESS = 50; // safety cap vs. “infinite” holds

  const performPet = useCallback(() => {
    const now = Date.now();
    if (now - lastPetAt.current < PET_THROTTLE_MS) return; // throttle
    lastPetAt.current = now;

    // play audio safely
    try {
      SoundManager?.play?.("bark");
      if ("vibrate" in navigator) navigator.vibrate?.(10);
    } catch {
      /* no-op */
    }

    setPets((prev) => {
      const next = prev + 1;

      // reward coin every 5th pet
      if (next % 5 === 0) {
        dispatch(grantCoins(1));
        // pulse feedback
        setCoinFlash(true);
        const el = liveRegionRef.current;
        if (el) el.textContent = `+1 coin earned, total pets ${next}`;
        window.setTimeout(() => setCoinFlash(false), 500);
      }

      // update visible mini-streak 0..4
      setStreak(next % 5); // 0 after payout, 1..4 otherwise
      return next;
    });
  }, [dispatch]);

  const startHold = useCallback(() => {
    // kick one pet immediately for responsiveness
    performPet();

    let count = 0;
    // start a delayed auto-repeat
    const start = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(() => {
        if (count++ > MAX_HOLD_PETS_PER_PRESS) return stopHold();
        performPet();
      }, HOLD_REPEAT_MS);
    }, HOLD_START_DELAY);

    // store the initial timeout so we can clear it on cancel
    repeatTimer.current = { __isStartup: true, id: start };
  }, [performPet]);

  const stopHold = useCallback(() => {
    const t = repeatTimer.current;
    if (!t) return;
    if (t.__isStartup) {
      window.clearTimeout(t.id);
    } else {
      window.clearInterval(t);
    }
    repeatTimer.current = null;
  }, []);

  useEffect(() => () => stopHold(), [stopHold]);

  // Keyboard support: Space/Enter = pet (supports hold via key repeat)
  const onKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      performPet();
    }
  };

  // Pointer events for press/hold UX
  const onPointerDown = (e) => {
    e.preventDefault();
    startHold();
  };

  const onPointerUp = () => stopHold();
  const onPointerLeave = () => stopHold();
  const onPointerCancel = () => stopHold();

  // Visual streak dots (0..4)
  const dots = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-black/5 dark:bg-slate-900 dark:text-slate-100 dark:border-white/10">
      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
        Affection
      </h3>
      <p className="text-sm text-rose-900/70 dark:text-rose-300/70">
        Tap or press-and-hold to pet your dog. Every <b>5</b> pets → <b>+1</b>{" "}
        coin.
      </p>

      {/* Streak meter & counters */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {dots.map((i) => (
            <span
              key={i}
              className={[
                "h-2.5 w-2.5 rounded-full transition-transform duration-150",
                i < (streak || 5) && streak !== 0
                  ? "bg-rose-600 scale-100"
                  : "bg-rose-200 dark:bg-rose-800/50 scale-90",
              ].join(" ")}
              aria-hidden
            />
          ))}
        </div>
        <div className="text-xs opacity-70">Pets: {pets}</div>
      </div>

      {/* Pet button */}
      <button
        onClick={performPet}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerCancel}
        className={[
          "mt-4 w-full px-4 py-3 rounded-xl text-white active:scale-95 select-none",
          "bg-rose-600 hover:bg-rose-500 focus:outline-none focus-visible:ring-2",
          "ring-rose-400/60 shadow transition-all",
        ].join(" ")}
        aria-label="Pet the dog"
      >
        🐶 Give Belly Rub
      </button>

      {/* Coin flash */}
      <div
        className={[
          "pointer-events-none mt-3 h-6 overflow-visible",
          "flex items-center justify-center",
        ].join(" ")}
        aria-hidden
      >
        {coinFlash && (
          <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-300 text-amber-900 text-xs font-semibold animate-[pop_500ms_ease]">
            +1 coin!
          </span>
        )}
      </div>

      {/* SR-only live region for coin announcements */}
      <span ref={liveRegionRef} aria-live="polite" className="sr-only" />

      {/* tiny utility animation */}
      <style>{`
        @keyframes pop {
          0% { transform: translateY(6px) scale(0.85); opacity: 0; }
          50% { transform: translateY(0px) scale(1.05); opacity: 1; }
          100% { transform: translateY(-4px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
