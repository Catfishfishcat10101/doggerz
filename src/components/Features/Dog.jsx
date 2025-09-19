// src/components/Features/Dog.jsx
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addXP,
  changeHappiness,
  selectDirection,
  selectHappiness,
  selectPos,
  setDirection,
  setMoving,
  setPosition,
} from "../../redux/dogSlice";

/**
 * DogPanel
 * A self-contained control panel for the pup.
 * - No dependency on missing actions.
 * - Uses real reducers from dogSlice.
 * - Safe to drop below the world (renderBelowWorld) or on Settings/Profile pages.
 */
export default function DogPanel({
  step = 24,              // px per D-pad nudge
  world = { w: 640, h: 360, tile: 64 }, // fallback world, matches GameScreen defaults
  title = "Your Dog",
}) {
  const dispatch = useDispatch();
  const pos = useSelector(selectPos);
  const dir = useSelector(selectDirection);
  const happiness = useSelector(selectHappiness);

  // best-effort reads — won't explode if fields don't exist yet
  const xp = useSelector((s) => s.dog?.xp ?? 0);
  const level = useSelector((s) => s.dog?.level ?? 1);
  const name = useSelector((s) => s.dog?.name ?? "Doggo");

  const band = useMemo(() => {
    if (happiness > 66) return { bar: "bg-emerald-500", label: "Happy" };
    if (happiness > 33) return { bar: "bg-amber-500", label: "Okay" };
    return { bar: "bg-rose-500", label: "Low" };
  }, [happiness]);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const moveBy = useCallback(
    (dx, dy) => {
      // update direction first for sprite row hint
      if (Math.abs(dx) > Math.abs(dy)) {
        dispatch(setDirection(dx < 0 ? "left" : "right"));
      } else if (Math.abs(dy) > 0) {
        dispatch(setDirection(dy < 0 ? "up" : "down"));
      }

      dispatch(setMoving(true));

      const nx = clamp(pos.x + dx, 0, world.w - world.tile);
      const ny = clamp(pos.y + dy, 0, world.h - world.tile);

      dispatch(setPosition({ x: nx, y: ny, world }));
      // small delay to let walk state show — matches your loop semantics
      window.setTimeout(() => dispatch(setMoving(false)), 150);
    },
    [dispatch, pos.x, pos.y, world]
  );

  const onFeed = () => {
    // +happiness, +XP — tune to taste
    dispatch(changeHappiness(+6));
    dispatch(addXP(5));
  };
  const onPlay = () => {
    dispatch(changeHappiness(+10));
    dispatch(addXP(8));
  };
  const onBathe = () => {
    // fake cleanse: bigger mood bump, modest XP
    dispatch(changeHappiness(+12));
    dispatch(addXP(6));
  };
  const onTrick = (name = "Sit") => {
    // learning trick: bigger XP, small mood
    dispatch(addXP(12));
    dispatch(changeHappiness(+4));
    // optionally: persist a learned trick list in slice later
    console.debug("Learned trick:", name);
  };

  return (
    <section className="w-full max-w-xl mx-auto mt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-emerald-900 font-bold">
          {title}: <span className="text-emerald-900/80">{name}</span>
        </h2>
        <div className="text-sm text-emerald-900/70">
          Lv {level} • XP <span className="font-mono">{xp}</span>
        </div>
      </div>

      {/* HUD row */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Metric label="Happiness">
          <div className="h-2 bg-emerald-900/10 rounded">
            <div
              className={`h-2 rounded ${band.bar}`}
              style={{ width: `${clamp(happiness, 0, 100)}%` }}
              title={`${band.label} (${Math.round(happiness)}%)`}
            />
          </div>
        </Metric>

        <Metric label="Direction" valueClass="font-mono">
          {dir}
        </Metric>

        <Metric label="Position" valueClass="font-mono">
          {Math.round(pos.x)},{Math.round(pos.y)}
        </Metric>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
          onClick={onFeed}>
          🍖 Feed
        </button>
        <button className="px-3 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 active:scale-95"
          onClick={onPlay}>
          🦴 Play
        </button>
        <button className="px-3 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 active:scale-95"
          onClick={onBathe}>
          🛁 Bathe
        </button>
        <button className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 active:scale-95"
          onClick={() => onTrick("Sit")}>
          🎓 Learn “Sit”
        </button>
      </div>

      {/* D-pad / movement */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="grid grid-cols-3 gap-2">
          <span />
          <DpBtn onClick={() => moveBy(0, -step)}>⬆️</DpBtn>
          <span />
          <DpBtn onClick={() => moveBy(-step, 0)}>⬅️</DpBtn>
          <span className="rounded-lg bg-white/40 border border-emerald-900/10 w-10 h-10" />
          <DpBtn onClick={() => moveBy(step, 0)}>➡️</DpBtn>
          <span />
          <DpBtn onClick={() => moveBy(0, step)}>⬇️</DpBtn>
          <span />
        </div>
      </div>
    </section>
  );
}

/* ————— UI helpers ————— */

function Metric({ label, children, valueClass = "" }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs text-emerald-900/70">{label}</div>
      <div className={`mt-1 text-emerald-900 ${valueClass}`}>{children}</div>
    </div>
  );
}

function DpBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-lg bg-white/70 border border-emerald-900/10 hover:bg-white active:scale-95"
      title="Move"
    >
      {children}
    </button>
  );
}
