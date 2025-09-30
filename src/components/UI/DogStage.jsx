import React, { useEffect, useMemo, useRef, useState } from "react";
import DogSprite from "./DogSprite.jsx";

/**
 * Lightweight scene loop with keyboard controls and gentle stat decay.
 * - Focus ring & instructions until the user moves.
 * - Respect reduced motion (lower bobbing, slower speed).
 * - Yard zone on the right (18% width).
 */
export default function DogStage() {
  const stageRef = useRef(null);
  const [moved, setMoved] = useState(false);

  // Scene state (kept local; persist later if you want)
  const [pos, setPos] = useState({ x: 240, y: 160 });
  const [dir, setDir] = useState("right"); // left|right
  const [stats, setStats] = useState({
    hunger: 95,
    energy: 100,
    cleanliness: 98,
  });

  // Controls
  const keys = useRef({ ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, a: false, d: false, w: false, s: false });
  const pressed = () =>
    keys.current.ArrowLeft || keys.current.ArrowRight || keys.current.ArrowUp || keys.current.ArrowDown ||
    keys.current.a || keys.current.d || keys.current.w || keys.current.s;

  // Motion preferences
  const prefersReduced = useMemo(
    () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Tunables
  const SPEED = prefersReduced ? 140 : 180;          // px/sec walking speed
  const WORLD_PADDING = 16;                          // safe margin
  const YARD_FRACTION = 0.18;                        // right strip width
  const IDLE_DECAY_PER_MIN = { hunger: 0.8, energy: 0.4, cleanliness: 0.25 };
  const MOVE_DECAY_PER_MIN = { hunger: 1.2, energy: 1.8, cleanliness: 0.5 };

  // Sizing
  const [rect, setRect] = useState({ w: 800, h: 420 });
  useEffect(() => {
    function measure() {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ w: r.width, h: r.height });
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // Keyboard handlers
  useEffect(() => {
    function down(e) {
      if (e.repeat) return;
      switch (e.key) {
        case "ArrowLeft": case "a": keys.current[e.key] = true; setDir("left"); setMoved(true); break;
        case "ArrowRight": case "d": keys.current[e.key] = true; setDir("right"); setMoved(true); break;
        case "ArrowUp": case "w": keys.current[e.key] = true; setMoved(true); break;
        case "ArrowDown": case "s": keys.current[e.key] = true; setMoved(true); break;
        default: break;
      }
    }
    function up(e) {
      if (e.key in keys.current) keys.current[e.key] = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Game loop
  useEffect(() => {
    let raf;
    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp delta
      last = now;

      // Movement vector
      let vx = 0, vy = 0;
      if (keys.current.ArrowLeft || keys.current.a) vx -= 1;
      if (keys.current.ArrowRight || keys.current.d) vx += 1;
      if (keys.current.ArrowUp || keys.current.w) vy -= 1;
      if (keys.current.ArrowDown || keys.current.s) vy += 1;
      if (vx && !vy) setDir(vx < 0 ? "left" : "right");
      const mag = Math.hypot(vx, vy) || 1;

      // Yard boundary
      const yardX = rect.w * (1 - YARD_FRACTION);

      // Integrate position
      const speed = SPEED * (prefersReduced ? 0.85 : 1);
      let nx = pos.x + (vx / mag) * speed * dt;
      let ny = pos.y + (vy / mag) * speed * dt;

      // Bounds
      const DOG_W = 64, DOG_H = 64;
      const minX = WORLD_PADDING;
      const maxX = yardX - DOG_W - WORLD_PADDING;
      const minY = WORLD_PADDING;
      const maxY = rect.h - DOG_H - WORLD_PADDING;

      nx = Math.max(minX, Math.min(maxX, nx));
      ny = Math.max(minY, Math.min(maxY, ny));

      if (nx !== pos.x || ny !== pos.y) setPos({ x: nx, y: ny });

      // Stat decay (per minute → scale by dt)
      const d = pressed() ? MOVE_DECAY_PER_MIN : IDLE_DECAY_PER_MIN;
      setStats((s) => ({
        hunger: clamp01(s.hunger - (d.hunger / 60) * dt * 100),
        energy: clamp01(s.energy - (d.energy / 60) * dt * 100),
        cleanliness: clamp01(s.cleanliness - (d.cleanliness / 60) * dt * 100),
      }));

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rect.w, rect.h, pos.x, pos.y, SPEED, prefersReduced]);

  // Focus on mount
  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  const yardStyle = { width: `${Math.round(YARD_FRACTION * 100)}%` };

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      className="relative rounded-3xl border border-white/15 bg-neutral-900/40 backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-white/40 h-[58dvh] min-h-[360px]"
      aria-label="Doggerz play area"
    >
      {/* yard rail */}
      <div
        className="absolute top-0 right-0 h-full border-l border-white/10 bg-emerald-800/25 text-white/80 flex items-center justify-center rotate-180 [writing-mode:vertical-rl] rounded-tr-3xl rounded-br-3xl"
        style={yardStyle}
        aria-hidden="true"
      >
        Yard
      </div>

      {/* stage floor glow */}
      <div className="absolute inset-x-6 bottom-4 h-24 rounded-full bg-white/5 blur-2xl pointer-events-none" aria-hidden="true" />

      {/* dog sprite */}
      <DogSprite x={pos.x} y={pos.y} dir={dir} reduced={prefersReduced} />

      {/* helper hint */}
      {!moved && (
        <div className="absolute top-3 left-3 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white/90 border border-white/10">
          WASD / Arrow keys to move
        </div>
      )}
    </div>
  );
}

function clamp01(v) { return Math.max(0, Math.min(100, v)); }