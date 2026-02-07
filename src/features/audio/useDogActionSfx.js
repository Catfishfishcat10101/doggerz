/** @format */
// src/features/audio/useDogActionSfx.js

import * as React from "react";

import jrAudio from "@/features/audio/jrAudio.json";
import { withBaseUrl } from "@/utils/assetUrl.js";

const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

function stripConditionPrefix(key) {
  return key.replace(/^(stray_|tired_)/, "");
}

function resolveSoundKey(rawAnim) {
  const key = stripConditionPrefix(normalizeKey(rawAnim));
  if (jrAudio?.sounds?.[key]) return key;
  const alias = jrAudio?.aliases?.[key];
  if (alias && jrAudio?.sounds?.[alias]) return alias;
  return null;
}

function resolveLoopKey(rawAnim) {
  const key = stripConditionPrefix(normalizeKey(rawAnim));
  if (jrAudio?.sounds?.[key]?.loop) return key;
  if (key === "walk" && jrAudio?.sounds?.walk_right?.loop) return "walk_right";
  if (key === "walk_left" && jrAudio?.sounds?.walk_left?.loop) return "walk_left";
  if (key === "walk_right" && jrAudio?.sounds?.walk_right?.loop)
    return "walk_right";
  return null;
}

function createAudio(src, { loop = false } = {}) {
  try {
    const el = new Audio(src);
    el.preload = "auto";
    el.loop = Boolean(loop);
    return el;
  } catch {
    return null;
  }
}

function useUserGestureGate() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (ready) return;
    const unlock = () => setReady(true);
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [ready]);

  return ready;
}

export function useDogActionSfx({
  anim,
  frameIndex,
  energy,
  tier,
  audio,
}) {
  const audioEnabled = Boolean(audio?.enabled);
  const masterVolume = clamp01(audio?.masterVolume ?? 0.8);
  const sfxVolume = clamp01(audio?.sfxVolume ?? 0.7);
  const sleepVolume = clamp01(audio?.sleepVolume ?? 0.25);
  const sleepEnabled = audio?.sleepEnabled !== false;
  const baseVolume = clamp01(masterVolume * sfxVolume);
  const gestureReady = useUserGestureGate();

  const audioCacheRef = React.useRef(Object.create(null));
  const loopKeyRef = React.useRef(null);
  const sleepTimerRef = React.useRef(null);
  const lastFrameRef = React.useRef(null);
  const lastPlayAtRef = React.useRef(Object.create(null));

  const tierMultiplier = tier === "stray" ? 0.55 : tier === "tired" ? 0.75 : 1;
  const lowEnergy = Number(energy ?? 0) < 30 || tier === "stray";

  const getAudio = React.useCallback(
    (key, { loop = false } = {}) => {
      if (!key) return null;
      const existing = audioCacheRef.current[key];
      if (existing) return existing;
      const src = `${String(jrAudio?.basePath || "/audio/sfx/")}${
        jrAudio?.sounds?.[key]?.file || ""
      }`;
      if (!src || src.endsWith("/") || src.endsWith("/")) return null;
      const el = createAudio(withBaseUrl(src), { loop });
      if (!el) return null;
      audioCacheRef.current[key] = el;
      return el;
    },
    []
  );

  const stopAudio = React.useCallback((key) => {
    const el = audioCacheRef.current[key];
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      // ignore
    }
  }, []);

  const playOnce = React.useCallback(
    async (key, { volume = 1, cooldownMs = 400 } = {}) => {
      if (!audioEnabled || !gestureReady) return;
      const el = getAudio(key, { loop: false });
      if (!el) return;

      const now = Date.now();
      const last = Number(lastPlayAtRef.current[key] || 0);
      const cool = Math.max(0, Number(cooldownMs) || 0);
      if (now - last < cool) return;
      lastPlayAtRef.current[key] = now;

      try {
        el.pause();
        el.currentTime = 0;
        el.volume = clamp01(volume);
        const p = el.play();
        if (p && typeof p.then === "function") await p;
      } catch {
        // ignore autoplay failures
      }
    },
    [audioEnabled, gestureReady, getAudio]
  );

  React.useEffect(() => {
    if (audioEnabled) return;
    Object.values(audioCacheRef.current).forEach((el) => {
      if (!el) return;
      try {
        el.pause();
        el.currentTime = 0;
      } catch {
        // ignore
      }
    });
    loopKeyRef.current = null;
  }, [audioEnabled]);

  React.useEffect(() => {
    if (!audioEnabled) {
      if (loopKeyRef.current) stopAudio(loopKeyRef.current);
      loopKeyRef.current = null;
      return;
    }

    const loopKey = resolveLoopKey(anim);
    if (!loopKey) {
      if (loopKeyRef.current) stopAudio(loopKeyRef.current);
      loopKeyRef.current = null;
      return;
    }

    if (loopKeyRef.current && loopKeyRef.current !== loopKey) {
      stopAudio(loopKeyRef.current);
      loopKeyRef.current = null;
    }

    const meta = jrAudio?.sounds?.[loopKey] || {};
    const el = getAudio(loopKey, { loop: true });
    if (!el) return;

    const volume = clamp01(
      baseVolume * (Number(meta.volume ?? 1) || 1) * tierMultiplier
    );
    el.volume = volume;

    if (loopKeyRef.current !== loopKey) {
      loopKeyRef.current = loopKey;
      if (audioEnabled && gestureReady) {
        el.play().catch(() => {});
      }
    }

    return () => {
      if (loopKeyRef.current === loopKey) {
        stopAudio(loopKey);
        loopKeyRef.current = null;
      }
    };
  }, [anim, audioEnabled, baseVolume, gestureReady, getAudio, stopAudio, tierMultiplier]);

  React.useEffect(() => {
    if (sleepTimerRef.current) {
      window.clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (!audioEnabled || !gestureReady || !sleepEnabled) return;
    const resolved = resolveSoundKey(anim);
    if (resolved !== "sleep") return;

    const meta = jrAudio?.sounds?.sleep || {};
    const intervalMs = Math.max(800, Number(meta.intervalMs || 4000));
    const volume = clamp01(baseVolume * sleepVolume * (meta.volume ?? 1));

    sleepTimerRef.current = window.setInterval(() => {
      playOnce("sleep", { volume, cooldownMs: intervalMs - 200 });
    }, intervalMs);

    return () => {
      if (sleepTimerRef.current) {
        window.clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [anim, audioEnabled, baseVolume, gestureReady, playOnce, sleepVolume]);

  React.useEffect(() => {
    if (!audioEnabled || !gestureReady) return;
    if (frameIndex == null) return;

    if (lastFrameRef.current === frameIndex) return;
    lastFrameRef.current = frameIndex;

    const resolved = resolveSoundKey(anim);
    if (!resolved) return;

    let soundKey = resolved;
    let meta = jrAudio?.sounds?.[soundKey] || {};

    if (soundKey === "bark" && lowEnergy) {
      if (jrAudio?.sounds?.whimper) {
        soundKey = "whimper";
        meta = jrAudio.sounds.whimper;
      }
    }

    if (meta.loop || meta.intervalMs) return;
    const triggerFrame = Number(meta.triggerFrame);
    if (!Number.isFinite(triggerFrame)) return;
    if (frameIndex !== triggerFrame) return;

    const volume = clamp01(
      baseVolume * (Number(meta.volume ?? 1) || 1) * tierMultiplier
    );

    playOnce(soundKey, {
      volume,
      cooldownMs: Number(meta.cooldownMs || 400),
    });
  }, [anim, audioEnabled, baseVolume, frameIndex, gestureReady, lowEnergy, playOnce, tierMultiplier]);
}
