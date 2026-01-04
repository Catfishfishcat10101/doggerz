/** @format */

// src/components/useSleepAudio.js
// A tiny WebAudio "sleep ambience" loop.
// - No external assets (avoids missing-file issues)
// - Best-effort: respects autoplay restrictions and fails silently
// @ts-nocheck

import * as React from "react";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

export function useSleepAudio({
  active = false,
  enabled = true,
  volume = 0.2,
} = {}) {
  const ctxRef = React.useRef(null);
  const nodesRef = React.useRef(null);
  const [unlocked, setUnlocked] = React.useState(false);

  // Autoplay policies: WebAudio must be created/resumed after a user gesture.
  React.useEffect(() => {
    if (unlocked) return;
    const unlock = () => setUnlocked(true);
    window.addEventListener("pointerdown", unlock, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, {
      once: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [unlocked]);

  const stop = React.useCallback(() => {
    const nodes = nodesRef.current;
    if (nodes) {
      try {
        nodes.carrier?.stop?.();
      } catch {
        // ignore
      }
      try {
        nodes.lfo?.stop?.();
      } catch {
        // ignore
      }
      try {
        nodes.noiseSrc?.stop?.();
      } catch {
        // ignore
      }
      try {
        nodes.master?.disconnect?.();
      } catch {
        // ignore
      }
      nodesRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    const v = clamp(volume, 0, 1);
    if (!enabled || !active || v <= 0) {
      stop();
      return;
    }

    // Create/resume AudioContext.
    const AudioContextCtor = window?.AudioContext || window?.webkitAudioContext;
    if (!AudioContextCtor) return;

    let ctx = ctxRef.current;

    // If we haven't had a user gesture yet, don't create/resume WebAudio.
    // This prevents Chrome/Android autoplay warnings and repeated resume attempts.
    if (!unlocked && !ctx) return;

    if (!ctx) {
      try {
        ctx = new AudioContextCtor();
        ctxRef.current = ctx;
      } catch {
        return;
      }
    }

    // Best-effort resume (only after a user gesture).
    if (unlocked) {
      try {
        if (ctx.state === "suspended") void ctx.resume();
      } catch {
        // ignore
      }
    }

    // Already running.
    if (nodesRef.current) {
      try {
        nodesRef.current.master.gain.setTargetAtTime(
          0.006 * v,
          ctx.currentTime,
          0.08
        );
      } catch {
        // ignore
      }
      return;
    }

    try {
      // Master gain
      const master = ctx.createGain();
      master.gain.value = 0.006 * v;
      master.connect(ctx.destination);

      // A soft "breath" tone (very quiet)
      const carrier = ctx.createOscillator();
      carrier.type = "sine";
      carrier.frequency.value = 72;

      const carrierGain = ctx.createGain();
      carrierGain.gain.value = 0.25; // internal gain before master
      carrier.connect(carrierGain).connect(master);

      // LFO to simulate breathing (slow swell)
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.25; // ~4s per breath

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain);

      // Modulate carrierGain (not master) so volume slider stays stable.
      lfoGain.connect(carrierGain.gain);

      // Tiny filtered noise layer (very subtle) for texture
      const noiseBuf = ctx.createBuffer(
        1,
        ctx.sampleRate * 1.0,
        ctx.sampleRate
      );
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * 0.06;
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 420;
      noiseFilter.Q.value = 0.7;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.12;

      noiseSrc.connect(noiseFilter).connect(noiseGain).connect(master);

      carrier.start();
      lfo.start();
      noiseSrc.start();

      nodesRef.current = {
        master,
        carrier,
        carrierGain,
        lfo,
        lfoGain,
        noiseSrc,
        noiseGain,
      };

      return () => {
        stop();
      };
    } catch {
      stop();
    }
  }, [active, enabled, stop, unlocked, volume]);

  // Cleanup on unmount.
  React.useEffect(() => {
    return () => {
      stop();
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          ctx.close();
        } catch {
          // ignore
        }
        ctxRef.current = null;
      }
    };
  }, [stop]);
}
