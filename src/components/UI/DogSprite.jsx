import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bark, selectDirection, selectDog, selectStage } from "@/redux/dogSlice";
import "./DogSprite.css";

// Import sprite sheets from src so Vite fingerprints paths reliably
import puppyWalk  from "@/assets/sprites/puppy_walk.png";
import adultWalk  from "@/assets/sprites/adult_walk.png";
import seniorWalk from "@/assets/sprites/senior_walk.png";

/**
 * Per-stage sprite meta. If your sheets have different frame sizes, set
 * w/h per frame here. The CSS will scale via --sprite-scale if you want.
 */
const SHEETS = {
  puppy:  { src: puppyWalk,  frames: 6, w: 96,  h: 96,  scale: 1 },
  adult:  { src: adultWalk,  frames: 6, w: 112, h: 112, scale: 1 },
  senior: { src: seniorWalk, frames: 6, w: 120, h: 120, scale: 1 },
};

export default function DogSprite({ worldBottomPct = "12%" }) {
  const d   = useSelector(selectDog);
  const dir = useSelector(selectDirection);
  const stage = useSelector(selectStage);
  const dispatch = useDispatch();

  const meta = useMemo(() => SHEETS[stage] ?? SHEETS.adult, [stage]);

  // Position math: center sprite on x by subtracting half the width.
  const left = `${Math.max(0, (d.pos?.x ?? meta.w / 2) - (meta.w * meta.scale) / 2)}px`;

  const classNames = [
    "dog-sprite",
    "dog-sprite--walk",
    "dog-sprite--animating",
    "dog-sprite--shadow",
    "dog-sprite--interactive",
  ].join(" ");

  // Running vs paused animation + flip direction via CSS vars.
  const styleVars = {
    "--sprite-w": `${meta.w}px`,
    "--sprite-h": `${meta.h}px`,
    "--sprite-scale": meta.scale,
    "--flipX": dir === "left" ? -1 : 1,
    "--frames": meta.frames,
    "--speed-ms": d.moving ? "900ms" : "1400ms",
    "--play": d.moving ? "running" : "paused",
  };

  return (
    <div className="absolute" style={{ left, bottom: worldBottomPct }}>
      {/* The shadow ellipse is injected by ::after of .dog-sprite--shadow */}
      <div
        className={classNames}
        style={{
          ...styleVars,
          backgroundImage: `url(${meta.src})`,
        }}
        title="Click to bark"
        onClick={() => dispatch(bark(Date.now()))}
      />
    </div>
  );
}
