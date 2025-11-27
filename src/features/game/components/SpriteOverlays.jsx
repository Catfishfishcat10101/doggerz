import React from "react";

export default function SpriteOverlays({
  cleanlinessTier,
  inferredStage,
  baseSize,
}) {
  const cleanlinessOverlayClass = (() => {
    switch (cleanlinessTier) {
      case "DIRTY":
        return "bg-[radial-gradient(circle_at_30%_20%,rgba(120,53,15,0.35),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(67,20,7,0.4),transparent_60%)]";
      case "FLEAS":
        return "bg-[radial-gradient(circle_at_25%_30%,rgba(120,53,15,0.5),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(67,20,7,0.6),transparent_60%)]";
      case "MANGE":
        return "bg-[radial-gradient(circle_at_40%_30%,rgba(250,250,250,0.3),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(127,29,29,0.6),transparent_55%)]";
      default:
        return "";
    }
  })();

  const showFleas = cleanlinessTier === "FLEAS" || cleanlinessTier === "MANGE";

  return (
    <>
      {cleanlinessTier !== "FRESH" && (
        <>
          <div
            className={`absolute inset-0 mix-blend-multiply ${cleanlinessOverlayClass}`}
            aria-hidden="true"
          />
          {showFleas && (
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              {(() => {
                const presets = {
                  puppy: [
                    { x: 0.48, y: 0.28 },
                    { x: 0.62, y: 0.32 },
                    { x: 0.38, y: 0.42 },
                    { x: 0.52, y: 0.5 },
                    { x: 0.3, y: 0.38 },
                    { x: 0.68, y: 0.44 },
                  ],
                  adult: [
                    { x: 0.46, y: 0.3 },
                    { x: 0.6, y: 0.34 },
                    { x: 0.36, y: 0.46 },
                    { x: 0.54, y: 0.52 },
                    { x: 0.28, y: 0.4 },
                    { x: 0.7, y: 0.46 },
                  ],
                  senior: [
                    { x: 0.44, y: 0.32 },
                    { x: 0.58, y: 0.36 },
                    { x: 0.34, y: 0.48 },
                    { x: 0.56, y: 0.54 },
                    { x: 0.26, y: 0.42 },
                    { x: 0.72, y: 0.48 },
                  ],
                };

                const coords = presets[inferredStage] || presets.puppy;
                const fleaSize = Math.max(2, Math.round(baseSize * 0.03));

                return coords.map((pos, i) => {
                  const topPx = Math.round(pos.y * baseSize);
                  const leftPx = Math.round(pos.x * baseSize);
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full bg-black/80"
                      style={{
                        width: fleaSize,
                        height: fleaSize,
                        top: topPx,
                        left: leftPx,
                      }}
                    />
                  );
                });
              })()}
            </div>
          )}
        </>
      )}
    </>
  );
}
