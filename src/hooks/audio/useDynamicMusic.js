/** @format */
// src/hooks/audio/useDynamicMusic.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDog } from "@/hooks/useDogState.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";

const BASE_PATH = "/audio/";

const STATION_PLAYLISTS = Object.freeze({
  "event:adoption": [
    "playful-adventure.mp3",
    "evening-calm.mp3",
    "calm-loop.mp3",
    "playful-adventure.mp3",
  ],
  "event:growth": [
    "playful-adventure.mp3",
    "calm-loop.mp3",
    "playful-adventure.mp3",
    "evening-calm.mp3",
  ],
  "event:holiday": [
    "playful-adventure.mp3",
    "evening-calm.mp3",
    "calm-loop.mp3",
    "playful-adventure.mp3",
  ],
  "weather:storm": [
    "rain-loop.mp3",
    "low-mood.mp3",
    "rain-loop.mp3",
    "evening-calm.mp3",
  ],
  "weather:rain": [
    "rain-loop.mp3",
    "evening-calm.mp3",
    "rain-loop.mp3",
    "calm-loop.mp3",
  ],
  "weather:snow": [
    "evening-calm.mp3",
    "calm-loop.mp3",
    "rain-loop.mp3",
    "evening-calm.mp3",
  ],
  "weather:cloudy": [
    "calm-loop.mp3",
    "evening-calm.mp3",
    "calm-loop.mp3",
    "playful-adventure.mp3",
  ],
  "mood:sleepy": [
    "evening-calm.mp3",
    "rain-loop.mp3",
    "evening-calm.mp3",
    "calm-loop.mp3",
  ],
  "mood:low": [
    "low-mood.mp3",
    "evening-calm.mp3",
    "low-mood.mp3",
    "calm-loop.mp3",
  ],
  "mood:recovering": [
    "calm-loop.mp3",
    "evening-calm.mp3",
    "calm-loop.mp3",
    "low-mood.mp3",
  ],
  "mood:playful": [
    "playful-adventure.mp3",
    "calm-loop.mp3",
    "playful-adventure.mp3",
    "evening-calm.mp3",
  ],
  "time:night": [
    "evening-calm.mp3",
    "calm-loop.mp3",
    "evening-calm.mp3",
    "rain-loop.mp3",
  ],
  "time:day": [
    "calm-loop.mp3",
    "playful-adventure.mp3",
    "calm-loop.mp3",
    "evening-calm.mp3",
  ],
});

const HOLIDAY_DATES = Object.freeze([
  { month: 0, day: 1 },
  { month: 1, day: 14 },
  { month: 6, day: 4 },
  { month: 9, day: 31 },
  { month: 11, day: 25 },
]);

const FADE_STEP = 0.05;
const FADE_INTERVAL_MS = 50;
const MIN_STATION_HOLD_MS = 90 * 1000;
const AMBIENT_TRACKS = Object.freeze({
  rain: ["rain-loop.mp3", "night-shrine.mp3"],
  storm: ["rain-loop.mp3", "night-shrine.mp3"],
  default: ["night-shrine.mp3", "calm-loop.mp3"],
});

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function normalizeWeatherKey(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (!key) return "clear";
  if (["storm", "thunderstorm", "tstorm"].includes(key)) return "storm";
  if (["rain", "drizzle", "showers"].includes(key)) return "rain";
  if (["snow", "sleet", "hail", "ice"].includes(key)) return "snow";
  if (["cloudy", "overcast", "fog", "mist"].includes(key)) return "cloudy";
  return key;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonthDay(a, b) {
  if (!a || !b) return false;
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isHoliday(date) {
  if (!date) return false;
  return HOLIDAY_DATES.some(
    (entry) => entry.month === date.getMonth() && entry.day === date.getDate()
  );
}

function resolveEventStation(dog, now) {
  if (!dog) return null;
  const nowDate = parseDate(now);
  if (nowDate && isHoliday(nowDate)) return "event:holiday";
  const adoptedAt = parseDate(dog.adoptedAt);
  if (adoptedAt && nowDate && isSameMonthDay(adoptedAt, nowDate)) {
    return "event:adoption";
  }
  if (dog?.milestones?.pending?.toStage) return "event:growth";
  return null;
}

function resolveMoodStation(dog) {
  if (!dog) return null;
  const stats = dog.stats || {};
  const energy = Number(stats.energy ?? 0);
  const happiness = Number(stats.happiness ?? 0);
  const health = Number(stats.health ?? 0);
  const mood = String(dog.mood || dog.emotionCue || "")
    .trim()
    .toLowerCase();

  if (dog.isAsleep || mood === "sleepy" || energy <= 20) return "mood:sleepy";
  if (
    happiness <= 35 ||
    health <= 30 ||
    ["sad", "stressed", "fragile", "lonely", "sick", "dirty"].includes(mood)
  ) {
    return "mood:low";
  }
  if (health <= 55 || energy <= 35 || ["sore", "tired"].includes(mood)) {
    return "mood:recovering";
  }
  if (
    happiness >= 75 &&
    energy >= 55 &&
    ["happy", "excited"].includes(mood || "happy")
  ) {
    return "mood:playful";
  }
  return null;
}

function resolveTimeStation(now) {
  const date = parseDate(now) || new Date();
  const hour = date.getHours();
  return hour >= 21 || hour < 6 ? "time:night" : "time:day";
}

function buildQueue(tracks, lastTrack) {
  const list = (tracks || [])
    .filter(Boolean)
    .map((track) => (track.startsWith("/") ? track : `${BASE_PATH}${track}`));
  if (!list.length) return [];
  const shuffled = list.slice();
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (lastTrack && shuffled.length > 1 && shuffled[0] === lastTrack) {
    const swapIndex = shuffled.findIndex(
      (item, index) => index > 0 && item !== lastTrack
    );
    if (swapIndex > 0) {
      [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
    }
  }
  return shuffled;
}

function shouldInterruptStation(nextStation) {
  return (
    String(nextStation || "").startsWith("event:") ||
    nextStation === "weather:storm"
  );
}

function resolveAmbientCandidates(weatherKey) {
  if (weatherKey === "storm") return AMBIENT_TRACKS.storm;
  if (weatherKey === "rain") return AMBIENT_TRACKS.rain;
  return AMBIENT_TRACKS.default;
}

function useUserGestureGate(enabled = true) {
  const readyRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    if (readyRef.current) return;
    const unlock = () => {
      readyRef.current = true;
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

  return useCallback(() => Boolean(enabled) && readyRef.current, [enabled]);
}

export default function useDynamicMusic({ enabled = true } = {}) {
  const dog = useDog();
  const settings = useSelector(selectSettings);
  const weather = useSelector(selectWeatherCondition);

  const audioRef = useRef(null);
  const ambientRef = useRef(null);
  const currentTrackRef = useRef(null);
  const currentAmbientSrcRef = useRef(null);
  const ambientStateRef = useRef({
    key: "",
    candidates: [],
    index: 0,
  });
  const currentStationRef = useRef(null);
  const stationLockRef = useRef({ stationKey: null, startedAt: 0 });
  const fadeTimerRef = useRef(null);
  const radioStateRef = useRef({
    stationKey: null,
    queue: [],
    index: 0,
    lastTrack: null,
  });
  const trackTokenRef = useRef(0);
  const canPlay = useUserGestureGate(enabled);
  const [trackToken, setTrackToken] = useState(0);

  const stationKey = useMemo(() => {
    const now = Date.now();
    const eventStation = resolveEventStation(dog, now);
    if (eventStation) return eventStation;

    const weatherKey = normalizeWeatherKey(weather);
    if (weatherKey === "storm") return "weather:storm";
    if (weatherKey === "rain") return "weather:rain";
    if (weatherKey === "snow") return "weather:snow";
    if (weatherKey === "cloudy") return "weather:cloudy";

    const moodStation = resolveMoodStation(dog);
    if (moodStation) return moodStation;

    return resolveTimeStation(now);
  }, [dog, weather]);

  const requestNextTrack = useCallback(() => {
    setTrackToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof Audio === "undefined") return;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.loop = false;
      audioRef.current = audio;
    }
    if (!ambientRef.current) {
      const ambient = new Audio();
      ambient.preload = "metadata";
      ambient.loop = true;
      ambientRef.current = ambient;
    }
  }, [enabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      requestNextTrack();
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [requestNextTrack]);

  useEffect(() => {
    const ambient = ambientRef.current;
    if (!ambient) return;
    const handleError = () => {
      const ambientState = ambientStateRef.current;
      if (!Array.isArray(ambientState.candidates)) return;
      if (ambientState.index >= ambientState.candidates.length - 1) return;
      ambientState.index += 1;
      const fallbackSrc = ambientState.candidates[ambientState.index];
      if (!fallbackSrc || fallbackSrc === currentAmbientSrcRef.current) return;
      currentAmbientSrcRef.current = fallbackSrc;
      ambient.src = fallbackSrc;
      ambient.currentTime = 0;
      if (canPlay()) {
        ambient.play().catch(() => {});
      }
    };
    ambient.addEventListener("error", handleError);
    return () => {
      ambient.removeEventListener("error", handleError);
    };
  }, [canPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    const ambient = ambientRef.current;
    if (!audio) return;

    const audioEnabled = enabled && settings?.audio?.enabled !== false;
    const musicEnabled = settings?.audio?.musicEnabled !== false;
    const masterVolume = clamp01(settings?.audio?.masterVolume ?? 0.8);
    const musicVolume = clamp01(settings?.audio?.musicVolume ?? 0.5);
    const targetVolume = clamp01(masterVolume * musicVolume);

    if (!audioEnabled || !musicEnabled) {
      audio.pause();
      if (ambient) ambient.pause();
      return;
    }
    if (ambient) {
      const weatherKey = normalizeWeatherKey(weather);
      const ambientCandidates = resolveAmbientCandidates(weatherKey).map(
        (track) => `${BASE_PATH}${track}`
      );
      const ambientState = ambientStateRef.current;
      const ambientKey = `${weatherKey}:${ambientCandidates.join("|")}`;
      if (ambientState.key !== ambientKey) {
        ambientState.key = ambientKey;
        ambientState.candidates = ambientCandidates;
        ambientState.index = 0;
      }
      const ambientSrc =
        ambientState.candidates[ambientState.index] ||
        `${BASE_PATH}night-shrine.mp3`;
      const ambientVolBase =
        weatherKey === "storm" ? 0.2 : weatherKey === "rain" ? 0.16 : 0.1;
      const ambientVolume = clamp01(
        masterVolume * musicVolume * ambientVolBase
      );
      if (currentAmbientSrcRef.current !== ambientSrc) {
        currentAmbientSrcRef.current = ambientSrc;
        ambient.src = ambientSrc;
        ambient.currentTime = 0;
      }
      ambient.volume = ambientVolume;
      if (canPlay() && ambient.paused) {
        ambient.play().catch(() => {});
      }
    }

    const now = Date.now();
    const stationLock = stationLockRef.current;
    if (!stationLock.stationKey) {
      stationLock.stationKey = stationKey;
      stationLock.startedAt = now;
    }

    let effectiveStationKey = stationLock.stationKey || stationKey;
    if (stationKey !== effectiveStationKey) {
      const stationAgeMs = now - Number(stationLock.startedAt || 0);
      if (
        shouldInterruptStation(stationKey) ||
        stationAgeMs >= MIN_STATION_HOLD_MS
      ) {
        effectiveStationKey = stationKey;
        stationLock.stationKey = stationKey;
        stationLock.startedAt = now;
      }
    }

    const stationChanged = currentStationRef.current !== effectiveStationKey;
    const tokenChanged = trackTokenRef.current !== trackToken;
    if (tokenChanged) trackTokenRef.current = trackToken;
    const shouldAdvance =
      stationChanged || tokenChanged || !currentTrackRef.current;

    if (shouldAdvance) {
      const stationPlaylist =
        STATION_PLAYLISTS[effectiveStationKey] || STATION_PLAYLISTS["time:day"];
      const radioState = radioStateRef.current;
      if (stationChanged || radioState.stationKey !== effectiveStationKey) {
        radioState.queue = buildQueue(stationPlaylist, radioState.lastTrack);
        radioState.index = 0;
        radioState.stationKey = effectiveStationKey;
      }
      if (!Array.isArray(radioState.queue) || radioState.queue.length === 0) {
        radioState.queue = buildQueue(stationPlaylist, radioState.lastTrack);
        radioState.index = 0;
      }
      if (radioState.index >= radioState.queue.length) {
        radioState.queue = buildQueue(stationPlaylist, radioState.lastTrack);
        radioState.index = 0;
      }

      const nextTrack =
        radioState.queue[radioState.index % radioState.queue.length];
      if (!nextTrack) return;
      radioState.index += 1;
      radioState.lastTrack = nextTrack;

      currentStationRef.current = effectiveStationKey;
      currentTrackRef.current = nextTrack;

      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }

      const startTrack = () => {
        audio.src = nextTrack;
        audio.loop = false;
        audio.currentTime = 0;
        audio.volume = 0;
        if (canPlay()) {
          audio.play().catch(() => {});
        }
        fadeTimerRef.current = setInterval(() => {
          if (audio.volume < targetVolume - FADE_STEP) {
            audio.volume = clamp01(audio.volume + FADE_STEP);
            return;
          }
          audio.volume = targetVolume;
          clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }, FADE_INTERVAL_MS);
      };

      if (!audio.paused && audio.volume > FADE_STEP) {
        fadeTimerRef.current = setInterval(() => {
          if (audio.volume > FADE_STEP) {
            audio.volume = clamp01(audio.volume - FADE_STEP);
            return;
          }
          clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
          startTrack();
        }, FADE_INTERVAL_MS);
      } else {
        startTrack();
      }

      return;
    }

    audio.volume = targetVolume;
    if (canPlay() && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [
    enabled,
    canPlay,
    settings?.audio?.enabled,
    settings?.audio?.musicEnabled,
    settings?.audio?.masterVolume,
    settings?.audio?.musicVolume,
    stationKey,
    trackToken,
    weather,
  ]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current.src = "";
      }
    };
  }, []);

  return null;
}
