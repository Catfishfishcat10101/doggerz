// src/hooks/audio/useAmbientSoundscape.js
import { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";

import { selectSettings } from "@/store/settingsSlice.js";
import {
  selectWeatherCondition,
  selectWeatherIntensity,
} from "@/store/weatherSlice.js";

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

function normalizeWeatherKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (!key) return "clear";
  if (["storm", "thunderstorm", "tstorm"].includes(key)) return "storm";
  if (["rain", "drizzle", "showers"].includes(key)) return "rain";
  if (["snow", "sleet", "hail", "ice"].includes(key)) return "snow";
  if (["cloudy", "overcast", "fog", "mist"].includes(key)) return "cloudy";
  return "clear";
}

function normalizeIntensity(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (raw === "light" || raw === "drizzle") return 0.45;
  if (raw === "heavy" || raw === "storm" || raw === "thunder") return 1;
  if (raw === "medium" || raw === "normal") return 0.7;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return clamp01(numeric / 2);
  return 0.7;
}

function isDaytime() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 19;
}

function createNoiseBuffer(context) {
  const buffer = context.createBuffer(
    1,
    context.sampleRate * 2,
    context.sampleRate
  );
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function rampGain(gainNode, target, when = 0.18) {
  if (!gainNode?.gain || !gainNode.context) return;
  const now = gainNode.context.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(Math.max(0, target), now + when);
}

function scheduleBirdPhrase(context, gainNode, baseVolume) {
  if (!context || !gainNode || baseVolume <= 0.0005) return;

  const chirpCount = 1 + Math.floor(Math.random() * 3);
  let start = context.currentTime + 0.02 + Math.random() * 0.2;

  for (let i = 0; i < chirpCount; i += 1) {
    const osc = context.createOscillator();
    const chirpGain = context.createGain();
    const filter = context.createBiquadFilter();

    const peak = 2400 + Math.random() * 1800;
    const tail = peak - (500 + Math.random() * 450);
    const duration = 0.08 + Math.random() * 0.1;
    const volume = baseVolume * (0.65 + Math.random() * 0.35);

    osc.type = "sine";
    osc.frequency.setValueAtTime(peak, start);
    osc.frequency.exponentialRampToValueAtTime(tail, start + duration);

    filter.type = "bandpass";
    filter.frequency.value = peak;
    filter.Q.value = 7;

    chirpGain.gain.setValueAtTime(0.0001, start);
    chirpGain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    chirpGain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration + 0.045
    );

    osc.connect(filter);
    filter.connect(chirpGain);
    chirpGain.connect(gainNode);

    osc.start(start);
    osc.stop(start + duration + 0.06);

    start += duration + 0.06 + Math.random() * 0.08;
  }
}

export default function useAmbientSoundscape({ enabled = true } = {}) {
  const settings = useSelector(selectSettings);
  const weather = useSelector(selectWeatherCondition);
  const weatherIntensity = useSelector(selectWeatherIntensity);

  const contextRef = useRef(null);
  const masterGainRef = useRef(null);
  const rainGainRef = useRef(null);
  const birdGainRef = useRef(null);
  const rainSourceRef = useRef(null);
  const birdTimerRef = useRef(null);
  const unlockedRef = useRef(false);

  const weatherKey = useMemo(() => normalizeWeatherKey(weather), [weather]);
  const intensityFactor = useMemo(
    () => normalizeIntensity(weatherIntensity),
    [weatherIntensity]
  );

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === "undefined") return undefined;

    const unlock = async () => {
      unlockedRef.current = true;
      const context =
        contextRef.current ||
        new (window.AudioContext || window.webkitAudioContext)();
      contextRef.current = context;
      if (context.state === "suspended") {
        try {
          await context.resume();
        } catch {
          // ignore gesture resume failures
        }
      }
    };

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
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!unlockedRef.current) return;
    if (typeof window === "undefined") return;
    if (
      contextRef.current ||
      !(window.AudioContext || window.webkitAudioContext)
    )
      return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    contextRef.current = context;
  }, [enabled]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context || masterGainRef.current) return;

    const masterGain = context.createGain();
    const rainGain = context.createGain();
    const birdGain = context.createGain();

    masterGain.gain.value = 0;
    rainGain.gain.value = 0;
    birdGain.gain.value = 0;

    const rainFilter = context.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 1800;
    rainFilter.Q.value = 0.35;

    const rainToneFilter = context.createBiquadFilter();
    rainToneFilter.type = "highpass";
    rainToneFilter.frequency.value = 700;

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(context);
    noiseSource.loop = true;

    noiseSource.connect(rainToneFilter);
    rainToneFilter.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    birdGain.connect(masterGain);
    masterGain.connect(context.destination);

    noiseSource.start();

    masterGainRef.current = masterGain;
    rainGainRef.current = rainGain;
    birdGainRef.current = birdGain;
    rainSourceRef.current = noiseSource;

    return () => {
      try {
        noiseSource.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    const rainGain = rainGainRef.current;
    const birdGain = birdGainRef.current;
    if (!context || !masterGain || !rainGain || !birdGain) return;

    const audioEnabled = settings?.audio?.enabled !== false;
    const musicEnabled = settings?.audio?.musicEnabled !== false;
    const masterVolume = clamp01(settings?.audio?.masterVolume ?? 0.8);
    const musicVolume = clamp01(settings?.audio?.musicVolume ?? 0.5);
    const soundscapeEnabled =
      enabled && unlockedRef.current && audioEnabled && musicEnabled;

    const rainTarget =
      soundscapeEnabled && (weatherKey === "rain" || weatherKey === "storm")
        ? masterVolume *
          musicVolume *
          (weatherKey === "storm" ? 0.18 : 0.12) *
          (0.7 + intensityFactor * 0.65)
        : 0;
    const birdTarget =
      soundscapeEnabled &&
      weatherKey !== "rain" &&
      weatherKey !== "storm" &&
      isDaytime()
        ? masterVolume * musicVolume * 0.11
        : 0;

    rampGain(masterGain, soundscapeEnabled ? 1 : 0, 0.25);
    rampGain(rainGain, rainTarget, 0.22);
    rampGain(birdGain, birdTarget, 0.3);

    if (birdTimerRef.current) {
      window.clearTimeout(birdTimerRef.current);
      birdTimerRef.current = null;
    }

    if (birdTarget <= 0.0005) return;

    const queueNextBirdPhrase = () => {
      const waitMs = 5000 + Math.random() * 9000;
      birdTimerRef.current = window.setTimeout(() => {
        if (!birdGainRef.current || birdGainRef.current.gain.value <= 0.0005) {
          queueNextBirdPhrase();
          return;
        }
        scheduleBirdPhrase(context, birdGainRef.current, birdTarget);
        queueNextBirdPhrase();
      }, waitMs);
    };

    queueNextBirdPhrase();

    return () => {
      if (birdTimerRef.current) {
        window.clearTimeout(birdTimerRef.current);
        birdTimerRef.current = null;
      }
    };
  }, [
    enabled,
    intensityFactor,
    settings?.audio?.enabled,
    settings?.audio?.masterVolume,
    settings?.audio?.musicEnabled,
    settings?.audio?.musicVolume,
    weatherKey,
  ]);

  useEffect(() => {
    return () => {
      if (birdTimerRef.current) {
        window.clearTimeout(birdTimerRef.current);
      }
      if (rainSourceRef.current) {
        try {
          rainSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (contextRef.current) {
        contextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return null;
}
