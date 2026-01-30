/** /src/utils/canvasUtils.js
 * setupCanvasForSprite(canvas, { spriteSize, scale, enableResize, devicePixelRatio })
 * - Ensures canvas.width/height (the drawing buffer) are set for devicePixelRatio,
 *   while the CSS width/height remain the logical pixel size (spriteSize * scale).
 * - Options:
 *   - spriteSize (number) logical sprite size in CSS pixels (default 128)
 *   - scale (number) CSS scale applied to sprite (default 2)
 *   - enableResize (bool) attach a window resize handler to reflow buffer on resize
 *   - devicePixelRatio (number|null) override DPR for testing; if null uses window.devicePixelRatio
 *   - maxDpr (number) clamp DPR to avoid huge buffers on high-density screens
 *   - smoothing (bool) toggle image smoothing on the 2d context
 *   - background (string|null) optional CSS background color for the canvas
 *
 * Usage (React):
 *   useEffect(() => {
 *     const cvs = canvasRef.current;
 *     if (!cvs) return;
 *     const { ctx, cleanup } = setupCanvasForSprite(cvs, { enableResize: true });
 *     // draw using ctx (coordinates in logical pixels)
 *     return cleanup; // removes resize listener and stops managing the canvas
 *   }, []);
 */
export function setupCanvasForSprite(
  canvas,
  {
    spriteSize = 128,
    scale = 2,
    enableResize = false,
    devicePixelRatio = null,
    maxDpr = 2,
    smoothing = false,
    background = null,
  } = {}
) {
  if (!canvas) return null;
  // Resolve DPR override (use passed value when non-null, otherwise window DPR)
  const resolvedDpr = Math.max(
    1,
    Math.min(
      Number(maxDpr) || 2,
      devicePixelRatio != null
        ? Number(devicePixelRatio) || 1
        : window.devicePixelRatio || 1
    )
  );

  // Internal function to (re)compute sizes and apply buffer + transforms
  const applySizing = () => {
    // logical CSS size (px)
    const cssW = Math.round(spriteSize * scale);
    const cssH = Math.round(spriteSize * scale);

    // drawing buffer size (account for DPR)
    const bufW = Math.round(cssW * resolvedDpr);
    const bufH = Math.round(cssH * resolvedDpr);

    // Set the canvas drawing buffer only when it changes (avoids clearing too often)
    if (canvas.width !== bufW) canvas.width = bufW;
    if (canvas.height !== bufH) canvas.height = bufH;

    // Ensure the CSS visual size is the logical pixel dimensions
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    if (background) {
      canvas.style.background = String(background);
    }

    return { cssW, cssH };
  };

  // Mark canvas as JS-managed (CSS helper)
  canvas.classList.add("js-managed-canvas");

  // Apply sizing now and obtain css sizes
  const { cssW, cssH } = applySizing();

  const ctx = canvas.getContext("2d");
  if (ctx) {
    try {
      ctx.imageSmoothingEnabled = Boolean(smoothing);
    } catch {
      /* ignore */
    }
    // Reset any existing transform then apply DPR scaling so 1 unit == 1 CSS px
    if (typeof ctx.setTransform === "function") {
      ctx.setTransform(resolvedDpr, 0, 0, resolvedDpr, 0, 0);
    } else if (typeof ctx.scale === "function") {
      try {
        ctx.setTransform && ctx.setTransform(1, 0, 0, 1, 0, 0);
      } catch {
        /* ignore */
      }
      ctx.scale(resolvedDpr, resolvedDpr);
    }
  }

  // Resize handler (if enabled) will recompute buffer and update transform
  let resizeHandler = null;
  if (enableResize) {
    resizeHandler = () => {
      applySizing();
      // Only reapply transform if buffer changed; ctx is stable reference
      if (ctx) {
        try {
          ctx.imageSmoothingEnabled = Boolean(smoothing);
        } catch {
          /* ignore */
        }
        if (typeof ctx.setTransform === "function") {
          ctx.setTransform(resolvedDpr, 0, 0, resolvedDpr, 0, 0);
        } else if (typeof ctx.scale === "function") {
          try {
            ctx.setTransform && ctx.setTransform(1, 0, 0, 1, 0, 0);
          } catch {
            /* ignore */
          }
          ctx.scale(resolvedDpr, resolvedDpr);
        }
      }
      // Optional: dispatch a resize event or call a callback here if consumer needs it
    };

    window.addEventListener("resize", resizeHandler, { passive: true });
  }

  const cleanup = () => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    try {
      canvas.classList.remove("js-managed-canvas");
    } catch {
      /* ignore */
    }
  };

  return { ctx, cssW, cssH, dpr: resolvedDpr, cleanup };
}

export function clearCanvas(ctx, w, h) {
  if (!ctx) return;
  const width = Number(w);
  const height = Number(h);
  if (Number.isFinite(width) && Number.isFinite(height)) {
    ctx.clearRect(0, 0, width, height);
  }
}

export function drawCenteredImage(ctx, img, w, h, { scale = 1 } = {}) {
  if (!ctx || !img) return;
  const width = Number(w);
  const height = Number(h);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return;
  const imgW = img?.width || 0;
  const imgH = img?.height || 0;
  if (!imgW || !imgH) return;
  const s = Number(scale) || 1;
  const drawW = imgW * s;
  const drawH = imgH * s;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  ctx.drawImage(img, x, y, drawW, drawH);
}

export default setupCanvasForSprite;
