/** @format */

// src/features/audio/DynamicMusicSystem.jsx
// Adaptive ambient music driven by game context (time, mood, activity, weather).

import * as React from "react";
import { useSelector } from "react-redux";

import { selectSettings } from "@/utils/redux/settingsSlice.js";
import {
  DYNAMIC_MUSIC_CONFIG,
  DYNAMIC_MUSIC_TRACKS,
} from "@/config/dynamicMusic.js";

const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

const MOOD_TONES = Object.freeze({
  bright: new Set(["HAPPY", "PROUD", "SASSY"]),
  calm: new Set(["CALM", "SLEEPY"]),
  low: new Set(["LONELY", "DIRTY", "HUNGRY", "RESTLESS"]),
});

const ACTIVITY_MAP = Object.freeze({
  play: "play",
  train: "train",
  trainblocked: "train",
  rest: "rest",
  feed: "care",
  bathe: "care",
  potty: "care",
  scoop: "care",
  wake: "idle",
  session_start: "idle",
});

function normalizeWeather(raw) {
  const w = String(raw || "unknown").toLowerCase();
  return ["sun", "cloud", "rain", "snow", "unknown"].includes(w)
    ? w
    : "unknown";
}

function normalizeTimeOfDay(raw) {
  const t = String(raw || "").toLowerCase();
  return t || "afternoon";
}

function normalizeActivity(raw) {
  const key = String(raw || "").toLowerCase();
  return ACTIVITY_MAP[key] || "idle";
}

function deriveMoodTone(moodTag, stats) {
  const tag = String(moodTag || "").toUpperCase();
  if (MOOD_TONES.bright.has(tag)) return "bright";
  if (MOOD_TONES.calm.has(tag)) return "calm";
  if (MOOD_TONES.low.has(tag)) return "low";

  const happiness = Number(stats?.happiness ?? 0);
  const hunger = Number(stats?.hunger ?? 0);
  const energy = Number(stats?.energy ?? 0);

  if (hunger > 75 || happiness < 35) return "low";
  if (energy < 30) return "calm";
  if (happiness > 75 && hunger < 60) return "bright";
  return "neutral";
}

function matchesRule(rule, ctx) {
  if (!rule) return true;
  const entries = Object.entries(rule);
  for (const [key, expected] of entries) {
    const actual = ctx[key];
    if (Array.isArray(expected)) {
      if (!expected.includes(actual)) return false;
    } else if (expected !== actual) {
      return false;
    }
  }
  return true;
}

function selectScene(ctx) {
  const scenes = DYNAMIC_MUSIC_CONFIG.scenes || [];
  for (const scene of scenes) {
    if (matchesRule(scene.when, ctx)) return scene;
  }
  return (
    scenes.find((scene) => scene.id === DYNAMIC_MUSIC_CONFIG.fallbackSceneId) ||
    scenes[0] ||
    null
  );
}

function resolveTracks(trackIds) {
  return (trackIds || []).map((id) => DYNAMIC_MUSIC_TRACKS[id]).filter(Boolean);
}

function pickTrack(scene, currentTrackId) {
  if (!scene) return null;
  const tracks = resolveTracks(scene.trackIds);
  if (!tracks.length) return null;
  if (tracks.length === 1) return tracks[0];

  const candidates = tracks.filter((track) => track.id !== currentTrackId);
  const pool = candidates.length ? candidates : tracks;
  return pool[Math.floor(Math.random() * pool.length)];
}

function createAudio() {
  const el = new Audio();
  el.preload = "auto";
  el.loop = true;
  return el;
}

function safeStop(el) {
  if (!el) return;
  try {
    el.pause();
    el.currentTime = 0;
  } catch {
    // ignore
  }
}

export default function DynamicMusicSystem({
  timeOfDay,
  weather,
  moodTag,
  stats,
  activity,
  isAsleep,
}) {
  const settings = useSelector(selectSettings);

  const audioEnabled = Boolean(settings?.audio?.enabled);
  const masterVolume = clamp01(settings?.audio?.masterVolume ?? 0.8);
  const musicVolume = clamp01(settings?.audio?.musicVolume ?? 0.5);
  const sleepEnabled = settings?.audio?.sleepEnabled !== false;
  const sleepVolume = clamp01(settings?.audio?.sleepVolume ?? 0.25);

  const audioAllowed = audioEnabled && (!isAsleep || sleepEnabled);

  const audioARef = React.useRef(null);
  const audioBRef = React.useRef(null);
  const activeKeyRef = React.useRef("A");
  const activeTrackRef = React.useRef(null);
  const activeSceneRef = React.useRef(null);
  const lastSceneChangeRef = React.useRef(0);
  const lastTrackChangeRef = React.useRef(0);
  const targetVolumeRef = React.useRef(0);
  const sceneVolumeRef = React.useRef(1);
  const fadeRafRef = React.useRef(null);
  const [needsGesture, setNeedsGesture] = React.useState(false);

  const context = React.useMemo(
    () => ({
      timeOfDay: normalizeTimeOfDay(timeOfDay),
      weather: normalizeWeather(weather),
      moodTone: deriveMoodTone(moodTag, stats),
      activity: normalizeActivity(activity),
      isAsleep: Boolean(isAsleep),
    }),
    [timeOfDay, weather, moodTag, stats, activity, isAsleep]
  );

  const getActiveAudio = React.useCallback(() => {
    return activeKeyRef.current === "A" ? audioARef.current : audioBRef.current;
  }, []);

  const getInactiveAudio = React.useCallback(() => {
    return activeKeyRef.current === "A" ? audioBRef.current : audioARef.current;
  }, []);

  const stopAll = React.useCallback(() => {
    safeStop(audioARef.current);
    safeStop(audioBRef.current);
    activeTrackRef.current = null;
    activeSceneRef.current = null;
    lastSceneChangeRef.current = 0;
    lastTrackChangeRef.current = 0;
    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (audioARef.current && audioBRef.current) return;

    audioARef.current = createAudio();
    audioBRef.current = createAudio();

    return () => {
      stopAll();
      if (audioARef.current) audioARef.current.src = "";
      if (audioBRef.current) audioBRef.current.src = "";
      audioARef.current = null;
      audioBRef.current = null;
    };
  }, [stopAll]);

  React.useEffect(() => {
    if (!audioAllowed) {
      stopAll();
      return;
    }

    const baseVolume = clamp01(masterVolume * musicVolume);
    const sleepMultiplier = isAsleep ? sleepVolume : 1;
    targetVolumeRef.current = clamp01(baseVolume * sleepMultiplier);

    const active = getActiveAudio();
    if (active && !active.paused) {
      active.volume = clamp01(targetVolumeRef.current * sceneVolumeRef.current);
    }
  }, [
    audioAllowed,
    masterVolume,
    musicVolume,
    sleepVolume,
    isAsleep,
    stopAll,
    getActiveAudio,
  ]);

  const attemptPlay = React.useCallback(async (el) => {
    if (!el) return false;
    try {
      const p = el.play();
      if (p && typeof p.then === "function") {
        await p;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const fadeBetween = React.useCallback((fromEl, toEl, durationMs) => {
    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }

    const target = clamp01(targetVolumeRef.current * sceneVolumeRef.current);

    const start = performance.now();
    const tick = (now) => {
      const pct = Math.min(1, (now - start) / durationMs);
      if (fromEl) {
        fromEl.volume = clamp01(target * (1 - pct));
      }
      if (toEl) {
        toEl.volume = clamp01(target * pct);
      }

      if (pct < 1) {
        fadeRafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (fromEl) {
        safeStop(fromEl);
      }
      fadeRafRef.current = null;
    };

    fadeRafRef.current = requestAnimationFrame(tick);
  }, []);

  const switchTrack = React.useCallback(
    async (track, scene) => {
      if (!track || !audioAllowed) return;

      const activeEl = getActiveAudio();
      const nextEl = getInactiveAudio();
      if (!nextEl) return;

      const nextSrc = track.src;
      nextEl.src = nextSrc;
      nextEl.loop = true;
      nextEl.currentTime = 0;
      nextEl.volume = 0;

      sceneVolumeRef.current = clamp01(scene?.volume ?? 1);

      const started = await attemptPlay(nextEl);
      if (!started) {
        setNeedsGesture(true);
      }

      fadeBetween(activeEl, nextEl, DYNAMIC_MUSIC_CONFIG.fadeMs || 1200);

      activeKeyRef.current = activeKeyRef.current === "A" ? "B" : "A";
      activeTrackRef.current = track;
    },
    [attemptPlay, audioAllowed, fadeBetween, getActiveAudio, getInactiveAudio]
  );

  React.useEffect(() => {
    if (!audioAllowed) return;

    const scene = selectScene(context);
    if (!scene) return;

    const now = Date.now();
    const minSceneMs = Number(DYNAMIC_MUSIC_CONFIG.minSceneMs || 0);
    const minTrackMs = Number(DYNAMIC_MUSIC_CONFIG.minTrackMs || 0);

    const activeScene = activeSceneRef.current;
    const sceneChanged = !activeScene || activeScene.id !== scene.id;
    const canSwitchScene =
      sceneChanged && now - lastSceneChangeRef.current >= minSceneMs;

    if (sceneChanged && !canSwitchScene) {
      return;
    }

    if (sceneChanged) {
      activeSceneRef.current = scene;
      lastSceneChangeRef.current = now;
    }

    const currentTrackId = activeTrackRef.current?.id || null;
    const nextTrack = pickTrack(scene, currentTrackId);
    if (!nextTrack) return;

    const trackChanged = currentTrackId !== nextTrack.id;
    const canSwitchTrack =
      trackChanged && now - lastTrackChangeRef.current >= minTrackMs;

    if (!activeTrackRef.current || canSwitchTrack || sceneChanged) {
      switchTrack(nextTrack, scene);
      lastTrackChangeRef.current = now;
    }
  }, [audioAllowed, context, switchTrack]);

  React.useEffect(() => {
    if (!needsGesture || !audioAllowed) return;

    const tryResume = async () => {
      const active = getActiveAudio();
      if (!active) return;
      const ok = await attemptPlay(active);
      if (ok) setNeedsGesture(false);
    };

    const onPointer = () => {
      tryResume();
    };

    window.addEventListener("pointerdown", onPointer, { once: true });
    window.addEventListener("keydown", onPointer, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onPointer);
    };
  }, [needsGesture, audioAllowed, attemptPlay, getActiveAudio]);

  return null;
}
