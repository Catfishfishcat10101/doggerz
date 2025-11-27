import React, { useEffect, useState } from "react";
import useDogAnimation from "@/features/game/hooks/useDogAnimation.jsx";
import { loadSettings } from "@/utils/settings.js";

// Frame choreography referencing the vector spritesheet (frames 0..15)
// We'll play: run(0..3) -> sit(4) -> wag(5..7 loop) -> blink(8..9) -> eat(11) -> lay(13) -> idle(14)
const RUN_FRAMES = [0, 1, 2, 3];
const SIT_FRAME = 4;
const WAG_FRAMES = [5, 6, 7];
const BLINK_FRAMES = [8, 9, 10];
const EAT_FRAME = 11;
const LAY_FRAME = 13;
const IDLE_FRAME = 14;

export default function CinematicIntro({ onFinish }) {
  const STORAGE_KEY = "doggerz:seenIntro";
  const [visible, setVisible] = useState(() => {
    try {
      const appSettings = loadSettings();
      // Respect reduced motion preference: do not show cinematic
      if (appSettings.reducedMotion) return false;
      // If user set replayCinematic, always show when visiting
      if (appSettings.replayCinematic) return true;
      return !Boolean(
        window &&
          window.localStorage &&
          window.localStorage.getItem(STORAGE_KEY),
      );
    } catch {
      return true;
    }
  });

  const { spriteSrc, frameSize, cols, rows } = useDogAnimation();

  const [bgPos, setBgPos] = useState("0px 0px");
  const [playCounter, setPlayCounter] = useState(0);
  const [stayOpenOnFinish, setStayOpenOnFinish] = useState(false);
  const particles = React.useMemo(() => {
    // Simple fixed particle set with slight randomization
    return Array.from({ length: 8 }).map((_, i) => {
      const left = 10 + ((i * 9) % 80);
      const top = 20 + ((i * 13) % 50);
      const delay = (i % 4) * 120;
      const size = 4 + (i % 3) * 2;
      return { left, top, delay, size };
    });
  }, []);

  useEffect(() => {
    if (!visible || !spriteSrc) return;

    // helper to compute background position for frame index
    const posFor = (idx) => {
      const x = idx % cols;
      const y = Math.floor(idx / cols);
      return `${-x * frameSize}px ${-y * frameSize}px`;
    };

    let mounted = true;

    const runInterval = 100;
    const wagInterval = 200;

    // sequence orchestration using chained timeouts/intervals
    const playSequence = async () => {
      // Run twice for a fuller entry
      for (let r = 0; r < 2 && mounted; r++) {
        for (let i = 0; i < RUN_FRAMES.length && mounted; i++) {
          setBgPos(posFor(RUN_FRAMES[i]));
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, runInterval));
        }
        // small pause between runs
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 120));
      }

      if (!mounted) return;
      // Sit longer for emphasis
      setBgPos(posFor(SIT_FRAME));
      await new Promise((res) => setTimeout(res, 550));

      if (!mounted) return;
      // Wag loop ~1.6s at slightly faster tempo
      const wagLoops = 10;
      for (let w = 0; w < wagLoops && mounted; w++) {
        const f = WAG_FRAMES[w % WAG_FRAMES.length];
        setBgPos(posFor(f));
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) =>
          setTimeout(res, Math.max(140, wagInterval - 40)),
        );
      }

      if (!mounted) return;
      // Blink sequence (quick)
      for (let b = 0; b < BLINK_FRAMES.length && mounted; b++) {
        setBgPos(posFor(BLINK_FRAMES[b]));
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 120));
      }

      if (!mounted) return;
      // Eat briefly
      setBgPos(posFor(EAT_FRAME));
      await new Promise((res) => setTimeout(res, 600));

      if (!mounted) return;
      // Lay down + idle for a smooth finish
      setBgPos(posFor(LAY_FRAME));
      await new Promise((res) => setTimeout(res, 500));
      setBgPos(posFor(IDLE_FRAME));
      await new Promise((res) => setTimeout(res, 400));

      if (!mounted) return;
      if (!stayOpenOnFinish) {
        try {
          window.localStorage.setItem(STORAGE_KEY, "1");
        } catch {}
        setVisible(false);
        if (typeof onFinish === "function") onFinish();
      } else {
        // If user requested replay, keep the cinematic open for another play.
        setStayOpenOnFinish(false);
      }
    };

    playSequence();

    return () => {
      mounted = false;
    };
  }, [visible, spriteSrc, frameSize, cols, playCounter]);

  // Re-run sequence when playCounter increments (replay)
  useEffect(() => {
    if (!visible) return;
    // bumping playCounter is handled by the main effect dependency via spriteSrc/frameSize/cols
  }, [playCounter]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* soft backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative w-full max-w-2xl mx-auto px-4">
        <style>{`
          @keyframes particle-drift { 0% { transform: translateY(0) scale(1); opacity: 1 } 100% { transform: translateY(-18px) scale(0.9); opacity: 0 } }
          @keyframes vignette-pulse { 0%{ opacity: .9 } 50%{ opacity: .95 } 100%{ opacity: .9 } }
        `}</style>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 p-6 shadow-card">
          {/* vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.02), rgba(0,0,0,0.6))",
              mixBlendMode: "overlay",
            }}
          />

          {/* particle overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: p.size,
                  height: p.size,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 9999,
                  animation: `particle-drift 1800ms ease ${p.delay}ms forwards`,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="intro-run-container"
              style={{ transformOrigin: "left center" }}
            >
              <div className="transform-gpu">
                <div
                  className="w-48 h-48 mx-auto rounded-lg bg-black/0 shadow-2xl"
                  style={{
                    imageRendering: "pixelated",
                    backgroundImage: `url(${spriteSrc})`,
                    backgroundSize: `${frameSize * cols}px ${frameSize * rows}px`,
                    backgroundPosition: bgPos,
                    boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                    borderRadius: 12,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center mt-4">
            <h3 className="text-2xl font-bold text-white">
              Welcome to Doggerz
            </h3>
            <p className="text-sm text-zinc-300 mt-2">
              Meet your Jack Russell. Adopt, train, and bond.
            </p>
          </div>

          {/* controls: replay / skip */}
          <div className="absolute right-4 bottom-4 z-20 flex items-center gap-3">
            <button
              onClick={() => {
                setStayOpenOnFinish(true);
                setPlayCounter((c) => c + 1);
              }}
              className="rounded-md bg-zinc-800/70 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Replay
            </button>
            <button
              onClick={() => {
                try {
                  window.localStorage.setItem(STORAGE_KEY, "1");
                } catch {}
                setVisible(false);
                if (typeof onFinish === "function") onFinish();
              }}
              className="rounded-md bg-zinc-700/80 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
