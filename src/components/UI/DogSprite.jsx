import React, { useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bark, selectDirection, selectDog, selectStage } from "@/redux/dogSlice";
import "./DogSprite.css";

import puppyWalk  from "@/assets/sprites/puppy_walk.png";
import adultWalk  from "@/assets/sprites/adult_walk.png";
import seniorWalk from "@/assets/sprites/senior_walk.png";

const SHEETS = {
  puppy:  { src: puppyWalk,  frames: 6, w: 96,  h: 96,  scale: 1 },
  adult:  { src: adultWalk,  frames: 6, w: 112, h: 112, scale: 1 },
  senior: { src: seniorWalk, frames: 6, w: 120, h: 120, scale: 1 },
};
const DEFAULT_STAGE = "adult";

export default function DogSprite({ worldBottomPct = "12%" }) {
  const d         = useSelector(selectDog) || {};
  const dir       = useSelector(selectDirection) || "right";
  const stage     = useSelector(selectStage) || DEFAULT_STAGE;
  const dispatch  = useDispatch();

  const meta = useMemo(() => SHEETS[stage] ?? SHEETS[DEFAULT_STAGE], [stage]);

  useEffect(() => {
    if (!meta?.src) return;
    const img = new Image();
    img.src = meta.src;
  }, [meta?.src]);

  const x = Number(d?.pos?.x ?? meta.w * 0.5);

  const containerStyle = useMemo(
    () => ({ left: `${Math.max(0, x)}px`, bottom: worldBottomPct }),
    [x, worldBottomPct]
  );

  const classNames = [
    "dog-sprite",
    "dog-sprite--walk",
    "dog-sprite--shadow",
    "dog-sprite--interactive",
  ].join(" ");

  const styleVars = {
    "--sprite-w": `${meta.w}px`,
    "--sprite-h": `${meta.h}px`,
    "--sprite-scale": String(meta.scale ?? 1),
    "--flipX": dir === "left" ? -1 : 1,
    "--frames": String(meta.frames ?? 4),
    "--speed-ms": d?.moving ? "900ms" : "1400ms",
    "--play": d?.moving ? "running" : "paused",
    backgroundImage: `url(${meta.src})`,
  };

  const onBark = useCallback(() => {
    dispatch(bark(Date.now()));
    try { navigator.vibrate?.(8); } catch {}
  }, [dispatch]);

  return (
    <div
      className="dog-sprite-container absolute"
      style={containerStyle}
      // NOTE: do NOT set aria-hidden here; it hides the button from screen readers.
    >
      <button
        type="button"
        className={classNames}
        style={styleVars}
        title="Bark"
        aria-label="Bark"
        onClick={onBark}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onBark();
          }
        }}
      />
    </div>
  );
}
