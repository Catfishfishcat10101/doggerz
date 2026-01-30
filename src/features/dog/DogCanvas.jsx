//src/features/dog/DogCanvas.jsx
/** @format */
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSettings,
  setDogCanvasMotion,
  setDogCanvasScale,
  setDogCanvasShadow,
} from "@/redux/settingsSlice.js";

let pixiImportPromise = null;

function loadPixiModule() {
  if (!pixiImportPromise) {
    pixiImportPromise = import("./pixi/core");
  }
  return pixiImportPromise;
}

/**
 * DogCanvas
 * - Defensive Pixi renderer with graceful fallback.
 * - Does NOT assume @pixi/react; uses pixi.js directly.
 *
 * Props:
 *  - sheetUrl: spritesheet JSON path (optional)
 *  - imageUrl: static image path (optional, used if sheet missing/fails)
 *  - animation: animation name in spritesheet.animations (default "idle")
 *  - height: fixed height to avoid 0-height render traps
 */
export default function DogCanvas({
  sheetUrl = "",
  imageUrl = "",
  animation = "idle",
  height = 280,
  className = "",
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const hostRef = useRef(null);
  const appRef = useRef(null);
  const spriteRef = useRef(null);
  const menuRef = useRef(null);

  const [mode, setMode] = useState("loading"); // loading | pixi | fallback
  const [errorText, setErrorText] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const resolvedHeight = useMemo(() => {
    const h = Number(height);
    return Number.isFinite(h) && h > 80 ? h : 280;
  }, [height]);

  const reduceMotionSetting = settings?.reduceMotion || "system";
  const prefersReducedMotion = useMemo(() => {
    try {
      return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {
      return false;
    }
  }, []);
  const reduceMotion =
    reduceMotionSetting === "on" ||
    (reduceMotionSetting !== "off" && prefersReducedMotion);

  const perfMode = settings?.perfMode || "auto";
  const batterySaver = Boolean(settings?.batterySaver);

  const enableMotion = settings?.dogCanvasMotion !== false && !reduceMotion;
  const enableShadow = settings?.dogCanvasShadow !== false;
  const scaleSetting = settings?.dogCanvasScale || "normal";
  const scale =
    scaleSetting === "small" ? 1.35 : scaleSetting === "large" ? 1.9 : 1.6;

  const resolutionCap =
    perfMode === "on" || batterySaver || reduceMotion ? 1 : 2;

  useEffect(() => {
    if (!showOptions) return;
    const onPointerDown = (event) => {
      const el = menuRef.current;
      if (!el || el.contains(event.target)) return;
      setShowOptions(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowOptions(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showOptions]);

  useEffect(() => {
    let cancelled = false;
    const hostEl = hostRef.current;
    let resizeHandler = null;

    const cleanup = () => {
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
        resizeHandler = null;
      }
      try {
        if (appRef.current) {
          appRef.current.destroy({
            removeView: true,
            children: true,
            texture: true,
            baseTexture: true,
          });
          appRef.current = null;
        }
      } catch {
        // ignore
      }
      if (hostEl) hostEl.innerHTML = "";
    };

    async function boot() {
      try {
        if (!hostRef.current) return;

        hostRef.current.innerHTML = "";
        if (!cancelled) {
          setMode("loading");
          setErrorText("");
        }

        const pixiMod = await loadPixiModule().catch(() => null);
        if (!pixiMod) {
          if (!cancelled) {
            setMode("fallback");
            setErrorText("pixi.js not installed");
          }
          return;
        }

        const PIXI = pixiMod;
        const host = hostRef.current;

        const app = new PIXI.Application();
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, resolutionCap),
          width: host.clientWidth || 600,
          height: host.clientHeight || resolvedHeight,
        });

        if (cancelled) {
          app.destroy({
            removeView: true,
            children: true,
            texture: true,
            baseTexture: true,
          });
          return;
        }

        appRef.current = app;
        host.appendChild(app.canvas);

        resizeHandler = () => {
          if (!appRef.current || !hostRef.current) return;
          const w = hostRef.current.clientWidth || 600;
          const h = hostRef.current.clientHeight || resolvedHeight;
          appRef.current.renderer.resize(w, h);

          if (spriteRef.current) {
            spriteRef.current.x = w / 2;
            spriteRef.current.y = h * 0.78;
          }
        };

        window.addEventListener("resize", resizeHandler);

        let dogDisplay = null;

        if (sheetUrl) {
          try {
            const loaded = await PIXI.Assets.load(sheetUrl);
            const sheet = loaded?.spritesheet || loaded;

            const animations =
              sheet?.animations || sheet?.spritesheet?.animations || null;

            if (animations && animations[animation]?.length) {
              // PixiJS v8: AnimatedSprite expects array of Texture or {texture, time}
              let frames = animations[animation];
              // If frames are not Texture or {texture, time}, try to convert
              frames = frames.map((frame) => {
                if (frame instanceof PIXI.Texture) return frame;
                if (frame?.texture instanceof PIXI.Texture) return frame;
                if (typeof frame === "string" && sheet.textures?.[frame])
                  return sheet.textures[frame];
                return frame;
              });
              dogDisplay = new PIXI.AnimatedSprite(frames);
              dogDisplay.animationSpeed = 0.12;
              dogDisplay.play();
            } else if (sheet?.textures) {
              const firstKey = Object.keys(sheet.textures)[0];
              if (firstKey)
                dogDisplay = new PIXI.Sprite(sheet.textures[firstKey]);
            }
          } catch {
            // fall through
          }
        }

        if (!dogDisplay && imageUrl) {
          try {
            const tex = await PIXI.Assets.load(imageUrl);
            dogDisplay = new PIXI.Sprite(tex);
          } catch {
            // fall through
          }
        }

        if (!dogDisplay) {
          const g = new PIXI.Graphics();
          g.roundRect(0, 0, 180, 120, 24);
          g.fill({ color: 0x10b981, alpha: 0.16 });
          dogDisplay = g;
        }

        if (dogDisplay.anchor) {
          dogDisplay.anchor.set(0.5, 0.5);
        } else {
          if (dogDisplay.pivot) dogDisplay.pivot.set(90, 60);
        }

        const w = host.clientWidth || 600;
        const h = host.clientHeight || resolvedHeight;

        dogDisplay.x = w / 2;
        dogDisplay.y = h * 0.78;

        dogDisplay.scale?.set?.(scale);

        spriteRef.current = dogDisplay;

        if (enableShadow) {
          const shadow = new PIXI.Graphics();
          shadow.ellipse(0, 0, 140, 34);
          shadow.fill({ color: 0x000000, alpha: 0.22 });
          shadow.x = w / 2;
          shadow.y = h * 0.82;
          app.stage.addChild(shadow);
        }
        app.stage.addChild(dogDisplay);

        app.ticker.add(() => {
          const sprite = spriteRef.current;
          const renderer = appRef.current?.renderer;
          if (!sprite || !renderer) return;
          const hNow = renderer.height || resolvedHeight;
          const bob = enableMotion
            ? Math.sin(app.ticker.lastTime / 420) * 1.6
            : 0;
          sprite.y = hNow * 0.78 + bob;
        });

        resizeHandler();
        if (!cancelled) setMode("pixi");
      } catch (err) {
        if (!cancelled) {
          setMode("fallback");
          setErrorText(err?.message || "DogCanvas error");
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [
    sheetUrl,
    imageUrl,
    animation,
    resolvedHeight,
    scale,
    enableMotion,
    enableShadow,
    resolutionCap,
  ]);

  return (
    <div
      className={`group relative w-full overflow-hidden ${className}`}
      style={{ height: resolvedHeight }}
    >
      <div ref={hostRef} className="absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent"
        aria-hidden
      />
      <div className="absolute right-2 top-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowOptions((v) => !v)}
          className="pointer-events-auto rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70 opacity-0 transition group-hover:opacity-100"
        >
          View
        </button>
        {showOptions ? (
          <div className="pointer-events-auto absolute right-0 mt-2 w-56 space-y-2 rounded-2xl border border-white/10 bg-black/90 p-3 text-[11px] text-zinc-200 shadow-[0_16px_45px_rgba(0,0,0,0.45)]">
            <ToggleRow
              label="Floating motion"
              checked={enableMotion}
              onChange={(v) => dispatch(setDogCanvasMotion(v))}
            />
            <ToggleRow
              label="Shadow"
              checked={enableShadow}
              onChange={(v) => dispatch(setDogCanvasShadow(v))}
            />
            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span>Size</span>
              <select
                value={scaleSetting}
                onChange={(e) => dispatch(setDogCanvasScale(e.target.value))}
                className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-zinc-200"
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
            {(perfMode === "on" || batterySaver) && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-zinc-400">
                Performance mode active: reduced rendering quality.
              </div>
            )}
          </div>
        ) : null}
      </div>
      {mode !== "pixi" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
            {mode === "loading" ? "Loading dog…" : "Dog fallback active"}
            {errorText ? (
              <div className="mt-1 text-xs text-white/50">{errorText}</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(Boolean(e.target.checked))}
        className="h-4 w-4 accent-emerald-400"
      />
    </label>
  );
}
