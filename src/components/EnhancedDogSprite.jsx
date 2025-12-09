import React from 'react'

export default function EnhancedDogSprite() {
  return (
    <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center">
      <span className="text-sm text-gray-500">Dog sprite</span>
    </div>
  )
}
// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useEffect, useState } from "react";

export default function EnhancedDogSprite({
  spritePublicPath = "/assets/sprites/jack_russell_puppy.png",
  alt = "Dog sprite",
  className = "",
}) {
  const [readySrc, setReadySrc] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setErrored(false);
    setReadySrc(null);

    const candidates = [
      spritePublicPath,
      "/assets/sprites/jack_russell_puppy.png",
      "/assets/images/jack_russell_puppy.png",
      "/sprites/jack_russell_puppy.png",
      "/images/jack_russell_puppy.png",
    ];

    let idx = 0;
    const tried = [];

    const tryLoad = () => {
      if (cancelled) return;
      if (idx >= candidates.length) {
        setErrored(true);
        console.error(
          "[EnhancedDogSprite] Failed to load sprite after trying paths:\n" +
          tried.map((p) => `  • ${p}`).join("\n") +
          "\n\nQuick checks:\n" +
          `  • If you keep assets in /public, ensure the file exists at public${candidates[0]} and then restart Vite.\n` +
          `  • Open one of these URLs in your browser (e.g. http://localhost:5173${candidates[0]}) to see the HTTP response.\n` +
          "  • Alternatively, import the image from src/assets and pass its imported path into EnhancedDogSprite.",
        );
        return;
      }

      const url = candidates[idx++];
      tried.push(url);
      const img = new Image();
      img.decoding = "async";
      img.src = url;

      img.onload = () => {
        if (cancelled) return;
        setReadySrc(url);
        console.info("[EnhancedDogSprite] loaded sprite:", url);
      };

      img.onerror = (ev) => {
        if (cancelled) return;
      // log per-attempt as debug to avoid spamming console during normal dev
        console.debug(
          "[EnhancedDogSprite] attempt failed:",
          url,
          ev?.message ?? ev,
        );
        setTimeout(tryLoad, 30);
      };
    };

    tryLoad();

    return () => {
      cancelled = true;
    };
  }, [spritePublicPath]);

  if (errored) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-slate-900 text-zinc-500 ${className}`}
        role="img"
        aria-label="sprite placeholder"
      >
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="1"
            y="1"
            width="22"
            height="22"
            rx="4"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="1.5"
            fill="rgba(15,23,42,0.4)"
          />
          <path
            d="M7 14s1.5-3 5-3 5 3 5 3"
            stroke="rgba(148,163,184,0.6)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="10" r="1.1" fill="rgba(148,163,184,0.6)" />
          <circle cx="14.5" cy="10" r="1.1" fill="rgba(148,163,184,0.6)" />
        </svg>
      </div>
    );
  }

  if (!readySrc) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${className}`}
        aria-hidden
      >
        <div className="h-6 w-6 animate-pulse rounded-full bg-emerald-400/30" />
      </div>
    );
  }

  return (
    <img
      src={readySrc}
      alt={alt}
      // ensure the sprite image is constrained to the parent box (uses Tailwind)
      className={`block h-full w-full object-contain ${className}`}
      draggable={false}
      onError={(e) => {
  // Extra safety: if img fails after being set, show placeholder next render
        console.error(
          "[EnhancedDogSprite] img.onerror fired after readySrc set",
          readySrc,
          e,
        );
        setErrored(true);
      }}
    />
  );
}

EnhancedDogSprite.displayName = "EnhancedDogSprite";
EnhancedDogSprite.framework = "react";
EnhancedDogSprite.group = "components";
EnhancedDogSprite.propagateFirebaseReady = false;
EnhancedDogSprite.propagateUser = false;
EnhancedDogSprite.propagateDog = false;
EnhancedDogSprite.defaultSize = { width: 150, height: 150 };
