/** @format */

// src/hooks/useYardSfx.js
// @ts-check

import * as React from "react";

function canPlayM4a() {
  try {
    const a = document.createElement("audio");
    // Most compatible check for AAC-LC in MP4.
    return Boolean(
      a.canPlayType('audio/mp4; codecs="mp4a.40.2"') ||
      a.canPlayType("audio/mp4") ||
      a.canPlayType("audio/x-m4a")
    );
  } catch {
    return false;
  }
}

function pickBarkSrc() {
  if (canPlayM4a()) return "/audio/bark.m4a";
  return "";
}

function safeCreateAudio(src) {
  if (!src) return null;
  try {
    const el = new Audio(src);
    el.preload = "auto";
    return el;
  } catch {
    return null;
  }
}

/**
 * Small SFX helper for the yard.
 * - Uses <audio> for simplicity.
 * - Safe in browsers that block autoplay (we only call on user gestures).
 */
export function useYardSfx(settings) {
  const audioEnabled = Boolean(settings?.audio?.enabled);
  const masterVolume = Number(settings?.audio?.masterVolume ?? 0.8);
  const sfxVolume = Number(settings?.audio?.sfxVolume ?? 0.7);

  const barkRef = React.useRef(null);
  const whineRef = React.useRef(null);
  const scratchRef = React.useRef(null);
  const lastPlayAtRef = React.useRef({
    bark: 0,
    whine: 0,
    scratch: 0,
  });

  React.useEffect(() => {
    // Pre-create audio element once.
    if (typeof window === "undefined") return;
    if (barkRef.current || whineRef.current || scratchRef.current) return;

    barkRef.current = safeCreateAudio(pickBarkSrc());
    whineRef.current = null;
    scratchRef.current = null;

    return () => {
      try {
        [barkRef, whineRef, scratchRef].forEach((ref) => {
          if (!ref.current) return;
          ref.current.pause();
          ref.current.src = "";
        });
      } catch {
        // ignore
      }
      barkRef.current = null;
      whineRef.current = null;
      scratchRef.current = null;
    };
  }, []);

  // Keep volume updated.
  React.useEffect(() => {
    const mv = Number.isFinite(masterVolume) ? masterVolume : 0.8;
    const sv = Number.isFinite(sfxVolume) ? sfxVolume : 0.7;
    const volume = Math.max(0, Math.min(1, mv * sv));
    [barkRef, whineRef, scratchRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current.volume = volume;
    });
  }, [masterVolume, sfxVolume]);

  // If audio gets disabled while a sound is playing, stop it immediately.
  React.useEffect(() => {
    if (audioEnabled) return;
    try {
      [barkRef, whineRef, scratchRef].forEach((ref) => {
        if (!ref.current) return;
        ref.current.pause();
        ref.current.currentTime = 0;
      });
    } catch {
      // ignore
    }
  }, [audioEnabled]);

  const playSound = React.useCallback(
    async (key, ref, { throttleMs = 200 } = {}) => {
      if (!audioEnabled) return;
      const el = ref.current;
      if (!el) return;

      // Prevent overlapping/restarting the bark while it's still playing.
      if (!el.paused && !el.ended) return;

      const now = Date.now();
      const effectiveThrottleMs = Math.max(
        350,
        Number.isFinite(throttleMs) ? throttleMs : 0
      );
      if (now - (lastPlayAtRef.current[key] || 0) < effectiveThrottleMs) return;
      lastPlayAtRef.current[key] = now;

      try {
        el.currentTime = 0;
        // play() returns a promise in modern browsers.
        const p = el.play();
        if (p && typeof p.then === "function") {
          await p;
        }
      } catch {
        // Autoplay policy or decode errors. Ignore silently.
      }
    },
    [audioEnabled]
  );

  const playBark = React.useCallback(
    (opts) => playSound("bark", barkRef, opts),
    [playSound]
  );

  const playWhine = React.useCallback(
    (opts) => playSound("whine", whineRef, opts),
    [playSound]
  );

  const playScratch = React.useCallback(
    (opts) => playSound("scratch", scratchRef, opts),
    [playSound]
  );

  return { playBark, playWhine, playScratch };
}
