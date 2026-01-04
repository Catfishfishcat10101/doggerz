// src/features/game/components/WeatherFXCanvas.jsx
// @ts-nocheck

import * as React from "react";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export default function WeatherFXCanvas({
  mode, // "sun" | "rain" | "snow" | "none"
  reduceMotion = false,
  reduceTransparency = false,
  className = "",
}) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const particlesRef = React.useRef([]);
  const lastTRef = React.useRef(0);

  const effectiveMode =
    String(mode || "none").toLowerCase() === "rain"
      ? "rain"
      : String(mode || "none").toLowerCase() === "snow"
        ? "snow"
        : "none";

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const getClientSize = () => {
      // Prefer the actual viewport client box (excludes scrollbars), which avoids
      // horizontal overflow + "scrollbar jitter" compared to window.innerWidth.
      const el = document.documentElement;
      const w = Number(el?.clientWidth) || window.innerWidth || 1;
      const h = Number(el?.clientHeight) || window.innerHeight || 1;
      return { w, h };
    };

    const resize = () => {
      const { w, h } = getClientSize();
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Keep CSS sizing relative to the parent container.
      canvas.style.width = `100%`;
      canvas.style.height = `100%`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  React.useEffect(() => {
    // Reset particles when mode changes.
    particlesRef.current = [];
  }, [effectiveMode]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (reduceMotion || effectiveMode === "none") {
      // Clear and stop.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    // Seeded RNG (xorshift32). Keep the seed as a valid 32-bit integer.
    const rng = makeRng((0xd06e3a2 ^ Date.now()) >>> 0);

    const spawn = (count) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;

      for (let i = 0; i < count; i++) {
        if (effectiveMode === "rain") {
          const x = rng() * w;
          const y = rng() * h;
          const speed = 650 + rng() * 650;
          const len = 12 + rng() * 18;
          const wind = -80 + rng() * 160;
          particlesRef.current.push({ type: "rain", x, y, speed, len, wind });
        } else if (effectiveMode === "snow") {
          const x = rng() * w;
          const y = rng() * h;
          const speed = 55 + rng() * 120;
          const r = 0.8 + rng() * 1.9;
          const drift = -30 + rng() * 60;
          const wobble = 0.6 + rng() * 1.6;
          particlesRef.current.push({
            type: "snow",
            x,
            y,
            speed,
            r,
            drift,
            wobble,
            phase: rng() * 6.28,
          });
        }
      }
    };

    const targetCount = () => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const area = (w * h) / (1280 * 720);
      const base = effectiveMode === "rain" ? 110 : 80;
      const scaled = base * clamp(area, 0.6, 1.8);
      return Math.round(reduceTransparency ? scaled * 0.55 : scaled);
    };

    const tick = (t) => {
      const w = canvas.clientWidth || window.innerWidth || 1;
      const h = canvas.clientHeight || window.innerHeight || 1;
      const dt = Math.min(0.035, (t - (lastTRef.current || t)) / 1000);
      lastTRef.current = t;

      // maintain particle count
      const desired = targetCount();
      const current = particlesRef.current.length;
      if (current < desired) spawn(Math.min(desired - current, 12));

      ctx.clearRect(0, 0, w, h);

      if (effectiveMode === "rain") {
        ctx.lineWidth = 1;
        ctx.strokeStyle = reduceTransparency
          ? "rgba(186, 230, 253, 0.18)"
          : "rgba(186, 230, 253, 0.26)";
        ctx.beginPath();

        for (const p of particlesRef.current) {
          p.y += p.speed * dt;
          p.x += p.wind * dt;

          const x2 = p.x + p.wind * 0.015;
          const y2 = p.y + p.len;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(x2, y2);

          if (p.y > h + 40 || p.x < -80 || p.x > w + 80) {
            p.x = rng() * w;
            p.y = -40 - rng() * 200;
          }
        }

        ctx.stroke();
      } else if (effectiveMode === "snow") {
        ctx.fillStyle = reduceTransparency
          ? "rgba(255,255,255,0.22)"
          : "rgba(255,255,255,0.32)";
        for (const p of particlesRef.current) {
          p.phase += dt * p.wobble;
          p.y += p.speed * dt;
          p.x += (p.drift + Math.sin(p.phase) * 22) * dt;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          if (p.y > h + 20 || p.x < -60 || p.x > w + 60) {
            p.x = rng() * w;
            p.y = -20 - rng() * 150;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [effectiveMode, reduceMotion, reduceTransparency]);

  // Keep canvas on top of background but behind UI.
  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        // blending makes it feel integrated, but keep subtle
        mixBlendMode: reduceTransparency ? "normal" : "screen",
        opacity: effectiveMode === "none" ? 0 : 1,
      }}
    />
  );
}
