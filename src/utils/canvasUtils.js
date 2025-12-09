/**
 * setupCanvasForSprite(canvas, { spriteSize, scale })
 * - Ensures canvas.width/height (the drawing buffer) are set for devicePixelRatio,
 *   while the CSS width/height remain the logical pixel size (spriteSize * scale).
 *
 * Usage (React):
 *   useEffect(() => {
 *     const cvs = canvasRef.current;
 *     if (!cvs) return;
 *     const ctx = setupCanvasForSprite(cvs);
 *     // then draw with ctx (coordinates in logical pixels)
 *   }, []);
 */
export function setupCanvasForSprite(
  canvas,
  { spriteSize = 128, scale = 2 } = {},
) {
  if (!canvas) return null;
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  // logical CSS size (px)
  const cssW = Math.round(spriteSize * scale);
  const cssH = Math.round(spriteSize * scale);

  // drawing buffer size (account for DPR)
  const bufW = Math.round(cssW * dpr);
  const bufH = Math.round(cssH * dpr);

  // Set the canvas drawing buffer
  if (canvas.width !== bufW) canvas.width = bufW;
  if (canvas.height !== bufH) canvas.height = bufH;

  // Ensure the CSS visual size is the logical pixel dimensions
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;

  // Mark canvas as JS-managed (CSS helper)
  canvas.classList.add("js-managed-canvas");

  const ctx = canvas.getContext("2d");
  if (ctx && typeof ctx.setTransform === "function") {
    // Scale drawing operations so 1 unit = 1 CSS pixel
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { ctx, cssW, cssH, dpr };
}

export default setupCanvasForSprite;
