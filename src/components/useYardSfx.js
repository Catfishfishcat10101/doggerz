/** @format */

// src/features/game/components/useYardSfx.js
// @ts-nocheck

import * as React from 'react';

function canPlayM4a() {
  try {
    const a = document.createElement('audio');
    // Most compatible check for AAC-LC in MP4.
    return Boolean(
      a.canPlayType('audio/mp4; codecs="mp4a.40.2"') ||
        a.canPlayType('audio/mp4') ||
        a.canPlayType('audio/x-m4a')
    );
  } catch {
    return false;
  }
}

function pickBarkSrc() {
  // Prefer optimized AAC (smaller). If the browser can't decode m4a, disable bark SFX
  // rather than referencing a missing fallback file.
  return canPlayM4a() ? '/audio/bark.m4a' : null;
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
  const lastPlayAtRef = React.useRef(0);

  React.useEffect(() => {
    // Pre-create audio element once.
    // NOTE: prefer /audio/bark.m4a (optimized). If unsupported, bark SFX is disabled.
    if (typeof window === 'undefined') return;
    if (barkRef.current) return;

    const src = pickBarkSrc();
    if (!src) return;

    const el = new Audio(src);
    el.preload = 'auto';
    barkRef.current = el;

    return () => {
      try {
        if (barkRef.current) {
          barkRef.current.pause();
          barkRef.current.src = '';
        }
      } catch {
        // ignore
      }
      barkRef.current = null;
    };
  }, []);

  // Keep volume updated.
  React.useEffect(() => {
    const el = barkRef.current;
    if (!el) return;
    const mv = Number.isFinite(masterVolume) ? masterVolume : 0.8;
    const sv = Number.isFinite(sfxVolume) ? sfxVolume : 0.7;
    el.volume = Math.max(0, Math.min(1, mv * sv));
  }, [masterVolume, sfxVolume]);

  // If audio gets disabled while a sound is playing, stop it immediately.
  React.useEffect(() => {
    const el = barkRef.current;
    if (!el) return;
    if (audioEnabled) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // ignore
    }
  }, [audioEnabled]);

  const playBark = React.useCallback(
    async ({ throttleMs = 200 } = {}) => {
      if (!audioEnabled) return;
      const el = barkRef.current;
      if (!el) return;

      // Prevent overlapping/restarting the bark while it's still playing.
      if (!el.paused && !el.ended) return;

      const now = Date.now();
      const effectiveThrottleMs = Math.max(
        450,
        Number.isFinite(throttleMs) ? throttleMs : 0
      );
      if (now - lastPlayAtRef.current < effectiveThrottleMs) return;
      lastPlayAtRef.current = now;

      try {
        el.currentTime = 0;
        // play() returns a promise in modern browsers.
        const p = el.play();
        if (p && typeof p.then === 'function') {
          await p;
        }
      } catch {
        // Autoplay policy or decode errors. Ignore silently.
      }
    },
    [audioEnabled]
  );

  return { playBark };
}
