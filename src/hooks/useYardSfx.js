

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

function clamp01(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric));
}

function getCareToneProfile(key = "") {
  switch (String(key || "").toLowerCase()) {
    case "feed":
      return { type: "tone", frequency: 220, endFrequency: 330, duration: 0.16 };
    case "water":
      return { type: "ripple", frequency: 520, endFrequency: 760, duration: 0.18 };
    case "play":
      return { type: "tone", frequency: 620, endFrequency: 880, duration: 0.2 };
    case "sleep":
      return { type: "tone", frequency: 240, endFrequency: 180, duration: 0.34 };
    case "clean":
      return { type: "noise", frequency: 900, endFrequency: 680, duration: 0.22 };
    case "potty":
      return { type: "tone", frequency: 390, endFrequency: 520, duration: 0.16 };
    default:
      return { type: "tone", frequency: 440, endFrequency: 520, duration: 0.14 };
  }
}

function getAudioContext(audioContextRef) {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext || window["webkitAudioContext"] || window.AudioContext;
    if (!Ctor) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new Ctor();
    }
    return audioContextRef.current;
  } catch {
    return null;
  }
}

function playSyntheticCareSound(audioContextRef, key, volume = 0.4) {
  const ctx = getAudioContext(audioContextRef);
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume?.().catch?.(() => {});
  }

  const profile = getCareToneProfile(key);
  const now = ctx.currentTime;
  const duration = Math.max(0.08, Number(profile.duration || 0.16));
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(clamp01(volume), now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  gain.connect(ctx.destination);

  if (profile.type === "noise") {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(profile.frequency, now);
    filter.frequency.linearRampToValueAtTime(profile.endFrequency, now + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    source.start(now);
    source.stop(now + duration);
    return;
  }

  const osc = ctx.createOscillator();
  osc.type = profile.type === "ripple" ? "triangle" : "sine";
  osc.frequency.setValueAtTime(profile.frequency, now);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(1, profile.endFrequency),
    now + duration
  );
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + duration);
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
  const audioContextRef = React.useRef(null);
  const lastPlayAtRef = React.useRef({
    bark: 0,
    whine: 0,
    scratch: 0,
    care: 0,
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

  const playCareSound = React.useCallback(
    (key, { throttleMs = 160, volume = 0.44 } = {}) => {
      if (!audioEnabled) return;
      const now = Date.now();
      const soundKey = `care:${String(key || "care").toLowerCase()}`;
      const effectiveThrottleMs = Math.max(
        80,
        Number.isFinite(throttleMs) ? throttleMs : 160
      );
      if (now - (lastPlayAtRef.current[soundKey] || 0) < effectiveThrottleMs) {
        return;
      }
      lastPlayAtRef.current[soundKey] = now;
      playSyntheticCareSound(
        audioContextRef,
        key,
        clamp01(Number(masterVolume || 0.8) * Number(sfxVolume || 0.7) * volume)
      );
    },
    [audioEnabled, masterVolume, sfxVolume]
  );

  return { playBark, playWhine, playScratch, playCareSound };
}
