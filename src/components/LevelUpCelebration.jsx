// src/components/LevelUpCelebration.jsx
// @ts-nocheck

import React, { useEffect } from "react";

function burstConfetti(canvas, { particles = 120, duration = 1500 } = {}) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  const DPR = window.devicePixelRatio || 1;
  const W = canvas.clientWidth * DPR;
  const H = canvas.clientHeight * DPR;
  canvas.width = W;
  canvas.height = H;

  const rnd = (min, max) => Math.random() * (max - min) + min;
  const colors = [
    "#22c55e",
    "#10b981",
    "#34d399",
    "#fde047",
    "#f59e0b",
    "#60a5fa",
  ];
  const parts = Array.from({ length: particles }, () => ({
    x: W / 2,
    y: H * 0.35,
    r: rnd(1.5, 3.5),
    a: rnd(-Math.PI, Math.PI),
    vx: rnd(-2.2, 2.2) * DPR,
    vy: rnd(-3.4, -1.6) * DPR,
    g: rnd(0.06, 0.12) * DPR,
    c: colors[Math.floor(Math.random() * colors.length)],
    life: rnd(0.8, 1.2),
  }));

  let start = performance.now();
  let rafId = 0;
  function tick(now) {
    const t = (now - start) / duration;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      const alpha = Math.max(0, 1 - t / p.life);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (t < 1.1) rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

export default function LevelUpCelebration({ level, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  useEffect(() => {
    try {
      const audioOn = localStorage.getItem("doggerz.setting.audioFx");
      if (audioOn !== null && audioOn !== "true") return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(660, ctx.currentTime);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.4);
      return () => ctx.close();
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto rounded-3xl border border-emerald-500/40 bg-slate-950/80 px-6 py-5 text-center shadow-[0_30px_80px_rgba(16,185,129,0.35)]">
          <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/90">
            Level Up
          </div>
          <div className="mt-1 text-4xl font-black tracking-tight text-emerald-300 drop-shadow-[0_0_18px_rgba(16,185,129,0.85)] animate-pulse">
            Level {level}
          </div>
          <div className="mt-2 text-[11px] text-emerald-200/80">
            Nice work! Keep training to earn more XP.
          </div>
        </div>
      </div>
      <ConfettiLayer />
    </div>
  );
}

function ConfettiLayer() {
  const ref = React.useRef(null);
  useEffect(() => {
    return burstConfetti(ref.current, { particles: 160, duration: 1700 });
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}
