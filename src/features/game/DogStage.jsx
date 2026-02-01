/** @format */
// src/features/game/DogStage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { withBaseUrl } from "@/utils/assetUrl.js";
import { selectSettings } from "@/redux/settingsSlice.js";

const STAGE_HEIGHT = 360;
const SHEET_COLUMNS = 7;
const SHEET_ROWS = 7;
const SHEET_FRAME_WIDTH = 124;
const SHEET_FRAME_HEIGHT = 144;
const SHEET_FRAME_COUNT = SHEET_COLUMNS * SHEET_ROWS;
const SHEET_FPS = 8;

export default function DogStage({ dog, scene }) {
  const settings = useSelector(selectSettings);
  const frameLabel = dog?.lifeStage?.label || "Puppy";

  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const spriteSheetUrl = useMemo(
    () => withBaseUrl("/sprites/doggerz-sit.png"),
    []
  );
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageReady, setImageReady] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setFrameIndex(0);
      return undefined;
    }

    const intervalMs = Math.max(40, Math.round(1000 / SHEET_FPS));
    const id = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % SHEET_FRAME_COUNT);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const frameX = (frameIndex % SHEET_COLUMNS) * SHEET_FRAME_WIDTH;
  const frameY = Math.floor(frameIndex / SHEET_COLUMNS) * SHEET_FRAME_HEIGHT;
  const spriteScale = 2.4;
  const spriteWidth = SHEET_FRAME_WIDTH * spriteScale;
  const spriteHeight = SHEET_FRAME_HEIGHT * spriteScale;

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imageRef.current = img;
      setImageReady(true);
    };
    img.onerror = () => {
      if (cancelled) return;
      imageRef.current = null;
      setImageReady(false);
    };
    img.src = spriteSheetUrl;
    return () => {
      cancelled = true;
    };
  }, [spriteSheetUrl]);

  useEffect(() => {
    if (!imageReady) return;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = spriteWidth;
    canvas.height = spriteHeight;
    ctx.clearRect(0, 0, spriteWidth, spriteHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      img,
      frameX,
      frameY,
      SHEET_FRAME_WIDTH,
      SHEET_FRAME_HEIGHT,
      0,
      0,
      spriteWidth,
      spriteHeight
    );
  }, [frameX, frameY, imageReady, spriteHeight, spriteWidth]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#05070d] via-[#07090f] to-black/70 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/80" />
      {reduceMotion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      ) : null}

      <div className="relative z-10 flex min-h-[320px] items-center justify-center px-3 py-6 sm:min-h-[360px] lg:min-h-[420px]">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="relative flex justify-center">
            <div className="dz-stage-floating">
              <div
                aria-hidden
                className="dz-stage-shadow pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2 z-0"
              />
              <div className="relative z-10 flex justify-center">
                <canvas
                  ref={canvasRef}
                  aria-hidden
                  className="select-none"
                  style={{
                    width: spriteWidth,
                    height: spriteHeight,
                    transformOrigin: "50% 100%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 pb-5 pt-3 text-[11px] uppercase tracking-[0.35em] text-white/60">
        <span>{dog?.name || "Pup"}</span>
        <span>{scene?.label || "Backyard"}</span>
        <span>{scene?.timeOfDay || "Night"}</span>
        <span
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em]"
          style={scene?.weatherAccent ? { color: scene.weatherAccent } : null}
        >
          {scene?.weather || "Clear"}
        </span>
        <span className="text-[10px] text-white/40">{frameLabel}</span>
      </div>
    </section>
  );
}
