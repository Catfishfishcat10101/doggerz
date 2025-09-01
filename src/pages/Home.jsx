// src/pages/Home.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startWalking, stopWalking, move, feed, play, rest } from "@redux/dogSlice";
import { selectCoreStats, selectProgress, selectAlerts } from "@redux/dogSelectors";
import DogSprite from "@features/DogSprite";

const SPRITE = 64;

export default function Home() {
  const dispatch = useDispatch();
  const { happiness, energy, hunger } = useSelector(selectCoreStats);
  const { level, xpPct } = useSelector(selectProgress);
  const alerts = useSelector(selectAlerts);

  // simple in-page “arena” so the sprite can move without MainGame.jsx
  const arenaRef = useRef(null);
  const [arena, setArena] = useState({ w: 0, h: 0, x: 96, y: 96, dir: "down", walking: false });

  useEffect(() => {
    const el = arenaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setArena((a) => ({ ...a, w: Math.floor(r.width), h: Math.floor(r.height) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = useCallback((x, y) => {
    const half = SPRITE / 2;
    const maxX = Math.max(half, arena.w - half);
    const maxY = Math.max(half, arena.h - half);
    return { x: Math.max(half, Math.min(x, maxX)), y: Math.max(half, Math.min(y, maxY)) };
  }, [arena.w, arena.h]);

  const step = useCallback((dx, dy) => {
    const stepSize = 16;
    const direction = dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";
    const { x, y } = clamp(arena.x + dx * stepSize, arena.y + dy * stepSize);
    setArena((a) => ({ ...a, x, y, dir: direction, walking: true }));
    dispatch(startWalking());
    setTimeout(() => {
      dispatch(move({ x, y, direction }));
      setArena((a) => ({ ...a, walking: false }));
      dispatch(stopWalking());
    }, 300);
  }, [arena.x, arena.y, clamp, dispatch]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === "w" || k === "ArrowUp") { e.preventDefault(); step(0, -1); }
      else if (k === "s" || k === "ArrowDown") { e.preventDefault(); step(0, 1); }
      else if (k === "a" || k === "ArrowLeft") { e.preventDefault(); step(-1, 0); }
      else if (k === "d" || k === "ArrowRight") { e.preventDefault(); step(1, 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const topLeftX = arena.x - SPRITE / 2;
  const topLeftY = arena.y - SPRITE / 2;

  return (
    <section className="space-y-12">
      <div className="card" style={{ display: "grid", gap: 16 }}>
        <div style={{ fontWeight: 700 }}>Pup Status • Level {level} • XP {xpPct}%</div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)" }}>
          <Stat label="Happiness" value={happiness} />
          <Stat label="Energy" value={energy} />
          <Stat label="Hunger" value={hunger} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn onClick={() => dispatch(feed())}>Feed</Btn>
          <Btn onClick={() => dispatch(play())}>Play</Btn>
          <Btn onClick={() => dispatch(rest())}>Rest</Btn>
          <span style={{ opacity: 0.7, fontSize: 13, marginLeft: 8 }}>
            Move with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows
          </span>
        </div>
        {!!alerts.length && (
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
            {alerts.map((a, i) => (
              <li key={i} style={{ color: a.type === "error" ? "#fecaca" : a.type === "warn" ? "#fde68a" : "#e5e7eb" }}>
                {a.msg}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div ref={arenaRef} className="card" style={{ position: "relative", height: 420, overflow: "hidden",
        background: "linear-gradient(120deg,#84fab0 0%,#8fd3f4 100%)" }}>
        <DogSprite
          x={topLeftX}
          y={topLeftY}
          size={SPRITE}
          direction={arena.dir}
          isWalking={arena.walking}
          // sheetSrc can be provided later (see DogSprite.jsx)
        />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  const pct = Math.max(0, Math.min(100, Math.round(value ?? 0)));
  return (
    <div>
      <div style={{ marginBottom: 6, fontSize: 14, opacity: 0.9 }}>{label}</div>
      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Btn({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ background: "#f59e0b", color: "#000", fontWeight: 700, borderRadius: 10, padding: "8px 14px",
        boxShadow: "0 8px 18px rgba(0,0,0,0.35)" }}>
      {children}
    </button>
  );
}