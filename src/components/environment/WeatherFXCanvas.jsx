// src/components/environment/WeatherFXCanvas.jsx

import * as React from "react";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function normalizeIntensity(value) {
  const raw = String(value || "").toLowerCase();
  if (raw === "light" || raw === "drizzle") return 0.7;
  if (raw === "heavy" || raw === "storm" || raw === "thunder") return 1.4;
  if (raw === "medium" || raw === "normal") return 1.0;
  if (Number.isFinite(Number(value))) return clamp(Number(value), 0.4, 2.0);
  return 1.0;
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
  intensity = "medium",
  reduceMotion = false,
  reduceTransparency = false,
  className = "",
}) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const particlesRef = React.useRef([]);
  const splashRef = React.useRef([]);
  const lastTRef = React.useRef(0);

  const effectiveMode =
    String(mode || "none").toLowerCase() === "rain"
      ? "rain"
      : String(mode || "none").toLowerCase() === "snow"
        ? "snow"
        : "none";

  const intensityFactor = normalizeIntensity(intensity);

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
    splashRef.current = [];
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

    const spawnRainSplash = (x, y, depth = 0.6) => {
      if (reduceMotion) return;
      const burstCount = depth > 0.8 ? 3 : 2;
      for (let i = 0; i < burstCount; i += 1) {
        splashRef.current.push({
          x,
          y,
          vx: (-20 + rng() * 40) * (0.8 + depth * 0.45),
          vy: -(55 + rng() * 65) * (0.75 + depth * 0.55),
          life: 0,
          ttl: 0.12 + rng() * 0.12,
          alpha: 0.12 + depth * 0.18,
          size: 0.8 + rng() * 1.4,
        });
      }
    };

    const spawn = (count) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;

      for (let i = 0; i < count; i++) {
        if (effectiveMode === "rain") {
          const x = rng() * w;
          const y = -rng() * h;
          const depth = 0.25 + rng() * 0.95;
          const speed =
            (620 + rng() * 760) *
            (0.78 + intensityFactor * 0.52) *
            (0.7 + depth * 0.52);
          const len =
            (10 + rng() * 20) *
            (0.8 + intensityFactor * 0.3) *
            (0.7 + depth * 0.45);
          const wind = (-85 + rng() * 170) * (0.55 + intensityFactor * 0.38);
          const width = 0.5 + depth * 1.15;
          const alpha = reduceTransparency
            ? 0.08 + depth * 0.1
            : 0.12 + depth * 0.18;
          const impactY = h * (0.68 + rng() * 0.28);
          particlesRef.current.push({
            type: "rain",
            x,
            y,
            speed,
            len,
            wind,
            width,
            alpha,
            depth,
            impactY,
          });
        } else if (effectiveMode === "snow") {
          const x = rng() * w;
          const y = rng() * h;
          const speed = (55 + rng() * 120) * (0.7 + intensityFactor * 0.4);
          const r = (0.8 + rng() * 1.9) * (0.75 + intensityFactor * 0.2);
          const drift = (-30 + rng() * 60) * (0.8 + intensityFactor * 0.25);
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
      const scaled = base * clamp(area, 0.6, 1.8) * intensityFactor;
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
      if (current < desired) {
        const burst = Math.min(
          desired - current,
          12 + Math.round(intensityFactor * 6)
        );
        spawn(burst);
      }

      ctx.clearRect(0, 0, w, h);

      if (effectiveMode === "rain") {
        if (!reduceTransparency) {
          const skyVeil = ctx.createLinearGradient(0, 0, 0, h);
          skyVeil.addColorStop(0, "rgba(94, 165, 233, 0.08)");
          skyVeil.addColorStop(0.5, "rgba(15, 23, 42, 0.03)");
          skyVeil.addColorStop(1, "rgba(2, 6, 23, 0.1)");
          ctx.fillStyle = skyVeil;
          ctx.fillRect(0, 0, w, h);
        }

        for (const p of particlesRef.current) {
          p.y += p.speed * dt;
          p.x += p.wind * dt;

          const dx = p.wind * 0.02;
          const x2 = p.x + dx;
          const y2 = p.y + p.len;
          const gradient = ctx.createLinearGradient(p.x, p.y, x2, y2);
          gradient.addColorStop(
            0,
            `rgba(226, 244, 255, ${Math.max(0.02, p.alpha * 0.08)})`
          );
          gradient.addColorStop(0.45, `rgba(198, 232, 255, ${p.alpha})`);
          gradient.addColorStop(
            1,
            `rgba(150, 210, 255, ${Math.max(0.02, p.alpha * 0.22)})`
          );
          ctx.strokeStyle = gradient;
          ctx.lineWidth = p.width;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          if (p.y >= p.impactY) {
            spawnRainSplash(p.x, p.impactY, p.depth);
            p.x = rng() * w;
            p.y = -40 - rng() * 200;
            p.impactY = h * (0.68 + rng() * 0.28);
          } else if (p.x < -80 || p.x > w + 80 || p.y > h + 40) {
            p.x = rng() * w;
            p.y = -40 - rng() * 200;
            p.impactY = h * (0.68 + rng() * 0.28);
          }
        }

        splashRef.current = splashRef.current.filter((splash) => {
          splash.life += dt;
          if (splash.life >= splash.ttl) return false;

          splash.x += splash.vx * dt;
          splash.y += splash.vy * dt;
          splash.vy += 210 * dt;

          const progress = splash.life / splash.ttl;
          const alpha = splash.alpha * (1 - progress);
          ctx.fillStyle = `rgba(198, 232, 255, ${Math.max(0, alpha)})`;
          ctx.beginPath();
          ctx.ellipse(
            splash.x,
            splash.y,
            splash.size * (1.2 - progress * 0.4),
            splash.size * 0.55,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          return true;
        });
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
  }, [effectiveMode, reduceMotion, reduceTransparency, intensityFactor]);

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
        mixBlendMode: "normal",
        opacity:
          effectiveMode === "rain"
            ? reduceTransparency
              ? 0.78
              : 0.92
            : effectiveMode === "none"
              ? 0
              : 1,
      }}
    />
  );
}
