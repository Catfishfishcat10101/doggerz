// src/components/DogCosmeticsOverlay.jsx
// Lightweight vector overlays for equipped cosmetics.
// @ts-nocheck

const COSMETIC_STYLES = {
  collar_leaf: {
    collar: { stroke: "rgba(16,185,129,0.95)", glow: "rgba(16,185,129,0.35)" },
  },
  collar_neon: {
    collar: { stroke: "rgba(56,189,248,0.95)", glow: "rgba(56,189,248,0.35)" },
  },
  tag_star: {
    tag: { fill: "rgba(250,204,21,0.95)", glow: "rgba(250,204,21,0.35)" },
  },
};

function styleFor(id) {
  const key = String(id || "").trim();
  return COSMETIC_STYLES[key] || {};
}

export default function DogCosmeticsOverlay({ equipped, size = 320, facing = 1, reduceMotion = false }) {
  const collarId = equipped?.collar || null;
  const tagId = equipped?.tag || null;

  if (!collarId && !tagId) return null;

  const collarStyle = styleFor(collarId)?.collar;
  const tagStyle = styleFor(tagId)?.tag;

  const keyframes = `
    @keyframes dg-cosmic-shimmer {
      0% { opacity: 0.78; transform: translate3d(0,0,0); }
      50% { opacity: 1; transform: translate3d(0,-0.5px,0); }
      100% { opacity: 0.78; transform: translate3d(0,0,0); }
    }
  `;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        width: size,
        height: size,
        transform: `scaleX(${facing})`,
        transformOrigin: "50% 100%",
      }}
      aria-hidden="true"
    >
      <style>{keyframes}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ display: "block" }}
      >
        {/* Collar: simple arc around the neck area */}
        {collarId ? (
          <g
            style={{
              filter: collarStyle?.glow ? `drop-shadow(0 0 10px ${collarStyle.glow})` : undefined,
              animation: reduceMotion ? "none" : "dg-cosmic-shimmer 2.6s ease-in-out infinite",
            }}
          >
            <path
              d="M34 57 C42 51, 58 51, 66 57"
              fill="none"
              stroke={collarStyle?.stroke || "rgba(16,185,129,0.9)"}
              strokeWidth="4.8"
              strokeLinecap="round"
            />
            <path
              d="M34 57 C42 51, 58 51, 66 57"
              fill="none"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        ) : null}

        {/* Tag */}
        {tagId ? (
          <g
            style={{
              filter: tagStyle?.glow ? `drop-shadow(0 0 12px ${tagStyle.glow})` : undefined,
              animation: reduceMotion ? "none" : "dg-cosmic-shimmer 2.0s ease-in-out infinite",
            }}
          >
            <circle
              cx="50"
              cy="64"
              r="6.2"
              fill={tagStyle?.fill || "rgba(250,204,21,0.9)"}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="1"
            />
            {/* star */}
            <path
              d="M50 58.5 L51.8 62.2 L55.8 62.7 L52.8 65.4 L53.6 69.3 L50 67.4 L46.4 69.3 L47.2 65.4 L44.2 62.7 L48.2 62.2 Z"
              fill="rgba(255,255,255,0.7)"
            />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
