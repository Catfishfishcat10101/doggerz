//src/features/dog/DogCanvas.jsx
/** @format */
import { useEffect, useMemo, useRef, useState } from "react";

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
  const hostRef = useRef(null);
  const appRef = useRef(null);
  const spriteRef = useRef(null);

  const [mode, setMode] = useState("loading"); // loading | pixi | fallback
  const [errorText, setErrorText] = useState("");

  const resolvedHeight = useMemo(() => {
    const h = Number(height);
    return Number.isFinite(h) && h > 80 ? h : 280;
  }, [height]);

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
          resolution: Math.min(window.devicePixelRatio || 1, 2),
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

        dogDisplay.scale?.set?.(1.6);

        spriteRef.current = dogDisplay;

        const shadow = new PIXI.Graphics();
        shadow.ellipse(0, 0, 140, 34);
        shadow.fill({ color: 0x000000, alpha: 0.22 });
        shadow.x = w / 2;
        shadow.y = h * 0.82;

        app.stage.addChild(shadow);
        app.stage.addChild(dogDisplay);

        app.ticker.add(() => {
          const sprite = spriteRef.current;
          const renderer = appRef.current?.renderer;
          if (!sprite || !renderer) return;
          const hNow = renderer.height || resolvedHeight;
          sprite.y = hNow * 0.78 + Math.sin(app.ticker.lastTime / 420) * 1.6;
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
  }, [sheetUrl, imageUrl, animation, resolvedHeight]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: resolvedHeight }}
    >
      <div ref={hostRef} className="absolute inset-0" />
      {mode !== "pixi" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
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
