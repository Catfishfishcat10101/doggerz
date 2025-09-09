import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Doggerz Splash Screen
 * - Animated gradient backdrop + subtle noise overlay
 * - Floating paw particles (auto-disables for reduced-motion)
 * - “Press Enter/Space or Tap” to start
 * - Long-press friendly on mobile
 * - Navigates to /game if user is authed, else /auth
 */
export default function Splash() {
  const navigate = useNavigate();
  const isAuthed = useSelector((s) => Boolean(s?.user?.id));
  const [pressing, setPressing] = useState(false);
  const holdTimer = useRef(null);
  const containerRef = useRef(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = () => {
    // tiny haptic feedback on supported phones (no-op elsewhere)
    if (navigator?.vibrate) navigator.vibrate(10);
    navigate(isAuthed ? "/game" : "/auth");
  };

  // Keyboard “Start”
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  // Long-press start (mobile)
  const startHold = () => {
    setPressing(true);
    holdTimer.current = setTimeout(go, 550);
  };
  const endHold = () => {
    setPressing(false);
    clearTimeout(holdTimer.current);
  };

  // Generate floating paws (disabled for reduced motion)
  const paws = useMemo(() => {
    if (prefersReducedMotion) return [];
    const count = 14;
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100;
      const size = 20 + Math.random() * 22; // px
      const delay = Math.random() * 6; // s
      const duration = 8 + Math.random() * 9; // s
      const rotate = -15 + Math.random() * 30; // deg
      return { id: i, left, size, delay, duration, rotate };
    });
  }, [prefersReducedMotion]);

  return (
    <main
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden text-white selection:bg-yellow-300/40 selection:text-white"
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Doggerz splash screen"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-gradient" />

      {/* Subtle texture/noise overlay to prevent color banding */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.035%22/></svg>')] mix-blend-overlay" />

      {/* Floating paw particles */}
      {!prefersReducedMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {paws.map((p) => (
            <span
              key={p.id}
              className="absolute opacity-60 paw-float"
              style={{
                left: `${p.left}%`,
                fontSize: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `rotate(${p.rotate}deg)`,
                top: "100%",
              }}
            >
              🐾
            </span>
          ))}
        </div>
      )}

      {/* Center card */}
      <section className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center p-6 text-center">
        <div className="glass-card w-full px-6 py-10">
          <LogoDog className="mx-auto mb-4 h-16 w-16 drop-shadow-md" />
          <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-sm sm:text-6xl">
            Doggerz <span className="align-middle">🐾</span>
          </h1>
          <p className="mt-3 text-lg text-white/85">
            A virtual pet simulator
          </p>

          <button
            type="button"
            onClick={go}
            className={`btn-start mt-8 ${pressing ? "scale-95" : ""}`}
            aria-label="Start Adventure"
          >
            Start Adventure
          </button>

          <p className="mt-4 text-sm text-white/70" aria-live="polite">
            {isAuthed ? "Welcome back! Continue your pup’s journey." : "New here? Let’s get you adopted."}
          </p>

          <kbd className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
            <span className="opacity-80">Press</span>
            <span className="rounded bg-black/30 px-2 py-0.5">Enter</span>
            <span className="opacity-80">or</span>
            <span className="rounded bg-black/30 px-2 py-0.5">Space</span>
            <span className="opacity-80">to start</span>
          </kbd>
        </div>

        {/* Footer badges */}
        <footer className="mt-8 text-xs text-white/70">
          v1.0 • Built with React, RTK, Vite, Tailwind, Firebase
        </footer>
      </section>
    </main>
  );
}

function LogoDog({ className = "" }) {
  // tiny, crisp inline SVG icon so you don’t need an asset file
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Doggerz logo"
    >
      <defs>
        <linearGradient id="dg" x1="0" x2="1">
          <stop offset="0" stopColor="#FFD66B" />
          <stop offset="1" stopColor="#FFB42C" />
        </linearGradient>
      </defs>
      <g fill="url(#dg)" stroke="white" strokeWidth="2">
        <circle cx="32" cy="34" r="18" />
        <circle cx="24" cy="26" r="4" fill="#fff" />
        <circle cx="40" cy="26" r="4" fill="#fff" />
        <circle cx="24" cy="26" r="2.2" fill="#333" />
        <circle cx="40" cy="26" r="2.2" fill="#333" />
        <path d="M28 40 q4 4 8 0" fill="none" stroke="#333" strokeWidth="3" />
        <path d="M18 18 l-8 -6 q-2 -1 -3 1 l2 10" />
        <path d="M46 18 l8 -6 q2 -1 3 1 l-2 10" />
      </g>
    </svg>
  );
}