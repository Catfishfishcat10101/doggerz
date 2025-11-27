import React from "react";

export default function SpriteCanvas({
  baseSize,
  animateWag,
  lqipDataUrl,
  imageLoaded,
  spriteSrc,
  computedBackgroundSize,
  computedBackgroundPosition,
  imageFailed,
}) {
  const shadowWidth = baseSize * 0.7;
  const shadowHeight = baseSize * 0.18;

  return (
    <>
      {/* Ground shadow */}
      <div
        className="pointer-events-none rounded-full bg-black/50 blur-md"
        style={{
          width: shadowWidth,
          height: shadowHeight,
          transform: "translateY(12px)",
        }}
        aria-hidden="true"
      />

      {/* Sprite body */}
      <div
        className="relative"
        style={{
          width: baseSize,
          height: baseSize,
          transform: animateWag ? "translateX(6px) rotate(3deg)" : undefined,
          transition: "transform 180ms ease",
        }}
        aria-hidden={true}
      >
        {/* Placeholder LQIP */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url(${lqipDataUrl})`,
            backgroundSize: "cover",
            filter: imageLoaded ? "none" : "blur(6px)",
            transition: "filter 280ms ease, opacity 220ms ease",
            opacity: imageLoaded ? 0.6 : 1,
          }}
          aria-hidden="true"
        />

        {/* Main sprite (fades in when loaded) */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            imageRendering:
              spriteSrc &&
              (spriteSrc.endsWith(".png") || spriteSrc.endsWith(".webp"))
                ? "pixelated"
                : "auto",
            backgroundImage: `url(${spriteSrc})`,
            backgroundSize: computedBackgroundSize,
            backgroundPosition: computedBackgroundPosition,
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 220ms ease",
          }}
          aria-hidden="true"
        />

        {/* Failed state overlay (accessible) */}
        {imageFailed && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl text-xs text-zinc-50"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Sprite failed to load</span>
            <span>Sprite unavailable</span>
          </div>
        )}
      </div>
    </>
  );
}
