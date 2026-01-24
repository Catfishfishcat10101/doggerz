/** @format */
/** @format */

/**
 * Subtle paw-print pattern overlay for the yard.
 * - No external image dependency (SVG data URI)
 * - Low opacity, sits behind dog
 * - Respects prefers-reduced-motion (animation stops)
 */
export default function YardPawPrints({ opacity = 0.1, scale = 1 }) {
  // Simple pawprint-ish SVG tiled pattern
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <g fill="white" fill-opacity="1">
        <circle cx="42" cy="36" r="7"/>
        <circle cx="60" cy="28" r="7"/>
        <circle cx="78" cy="36" r="7"/>
        <circle cx="55" cy="50" r="6"/>
        <path d="M60 58
                 c-16 0-26 12-26 20
                 c0 10 12 18 26 18
                 c14 0 26-8 26-18
                 c0-8-10-20-26-20z"/>
      </g>
    </svg>
  `);

  const bgSize = Math.max(72, Math.round(120 * scale));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat",
        backgroundSize: `${bgSize}px ${bgSize}px`,
        filter: "blur(0.1px)",
        transform: "translateZ(0)",
        // A mild gradient fade so it doesn’t read like wallpaper
        maskImage:
          "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 80%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 80%)",
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .doggerz-pawprints-animate {
            animation: doggerzPawDrift 18s linear infinite;
          }
          @keyframes doggerzPawDrift {
            0% { background-position: 0px 0px; }
            100% { background-position: 240px 180px; }
          }
        }
      `}</style>
      <div className="doggerz-pawprints-animate absolute inset-0" />
    </div>
  );
}
