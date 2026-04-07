import { toPercent } from "./sceneTokens.js";

export default function GroundShadow({
  xNorm = 0.5,
  yNorm = 0.8,
  widthPx = 140,
  heightPx = 26,
  opacity = 0.24,
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-[22]"
      style={{
        left: toPercent(xNorm),
        top: toPercent(yNorm),
        width: `${Math.max(24, Number(widthPx || 140))}px`,
        height: `${Math.max(10, Number(heightPx || 26))}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8,12,16,0.72) 0%, rgba(8,12,16,0.34) 48%, rgba(8,12,16,0) 100%)",
          opacity: Math.max(0.08, Math.min(0.4, Number(opacity || 0.24))),
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
