import React, { useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bark, selectDirection, selectDog, selectStage } from "@/redux/dogSlice";
import "./DogSprite.css";

import puppyWalk  from "@/assets/sprites/puppy_walk.png";
import adultWalk  from "@/assets/sprites/adult_walk.png";
import seniorWalk from "@/assets/sprites/senior_walk.png";

/** Sprite meta registry: frames, frame size (sheet frame, not rendered size),
 *  scale lets you enlarge per stage without touching art.
 */
const SHEETS = {
  puppy:  { src: puppyWalk,  frames: 6, w: 96,  h: 96,  scale: 1 },
  adult:  { src: adultWalk,  frames: 6, w: 112, h: 112, scale: 1 },
  senior: { src: seniorWalk, frames: 6, w: 120, h: 120, scale: 1 },
};
const DEFAULT_STAGE = "adult";

export default function DogSprite({ worldBottomPct = "12%" }) {
  const d       = useSelector(selectDog) || {};
  const dir     = useSelector(selectDirection) || "right";
  const stage   = useSelector(selectStage) || DEFAULT_STAGE;
  const dispatch = useDispatch();

  // Pick sheet by stage; fall back to default to avoid null art
  const meta = useMemo(() => SHEETS[stage] ?? SHEETS[DEFAULT_STAGE], [stage]);

  // Preload the active sprite sheet (avoids first-frame flash)
  useEffect(() => {
    if (!meta?.src) return;
    const img = new Image();
    img.src = meta.src;
  }, [meta?.src]);

  // World X in px; default to center of the sprite width if unknown
  const x = Number(d?.pos?.x ?? meta.w * 0.5);

  // Use left + translateX(-50%) so we truly center the sprite on its world X
  const containerStyle = useMemo(
    () => ({ left: `${Math.max(0, x)}px`, bottom: worldBottomPct }),
    [x, worldBottomPct]
  );

  const classNames = [
    "dog-sprite",
    "dog-sprite--walk",
    "dog-sprite--shadow",
    "dog-sprite--interactive",
    // Toggle the animation purely via CSS var --play for better perf
  ].join(" ");

  // Feed CSS vars to drive the animation and layout
  const styleVars = {
    "--sprite-w": `${meta.w}px`,
    "--sprite-h": `${meta.h}px`,
    "--sprite-scale": String(meta.scale ?? 1),
    "--flipX": dir === "left" ? -1 : 1,
    "--frames": String(meta.frames ?? 4),
    "--speed-ms": d?.moving ? "900ms" : "1400ms",
    "--play": d?.moving ? "running" : "paused",
    // background-image from JS keeps CSS side generic
    backgroundImage: `url(${meta.src})`,
  };

  const onBark = useCallback(() => {
    dispatch(bark(Date.now()));
    // haptic nudge if available
    try { navigator.vibrate?.(8); } catch {}
  }, [dispatch]);

  return (
    <div
      className="dog-sprite-container absolute"
      style={containerStyle}
      aria-hidden // container is non-interactive
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
