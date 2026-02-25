/** @format */
// src/features/audio/useDynamicMusic.js

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";

const MUSIC_PATHS = {
  day: "/audio/calm-loop.mp3",
  night: "/audio/night-shrine.mp3",
  lowMood: "/audio/low-mood.mp3",
  rain: "/audio/rain-loop.mp3",
};

const FADE_STEP = 0.05;
const FADE_INTERVAL_MS = 50;

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function useUserGestureGate() {
  const readyRef = useRef(false);

  useEffect(() => {
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
  }, []);

  return () => readyRef.current;
}

export default function useDynamicMusic() {
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const weather = useSelector(selectWeatherCondition);

  const audioRef = useRef(null);
  const currentTrackRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const canPlayRef = useUserGestureGate();

  const getTargetTrack = () => {
    if (!dog) return null;
    const stats = dog.stats || {};
    if ((stats.happiness <= 30 || stats.energy <= 30) && dog.adoptedAt) {
      return "lowMood";
    }
    if (String(weather || "").toLowerCase() === "rain") {
      return "rain";
    }
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6 ? "night" : "day";
  };

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.loop = true;
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioEnabled = settings?.audio?.enabled !== false;
    const musicEnabled = settings?.audio?.musicEnabled !== false;
    const masterVolume = clamp01(settings?.audio?.masterVolume ?? 0.8);
    const musicVolume = clamp01(settings?.audio?.musicVolume ?? 0.5);
    const targetVolume = clamp01(masterVolume * musicVolume);

    const targetKey = getTargetTrack();
    const targetSrc = targetKey ? MUSIC_PATHS[targetKey] : null;

    if (!audioEnabled || !musicEnabled) {
      audio.pause();
      return;
    }

    if (!targetSrc) return;

    if (currentTrackRef.current !== targetKey) {
      currentTrackRef.current = targetKey;

      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
      }

      fadeTimerRef.current = setInterval(() => {
        if (audio.volume > FADE_STEP) {
          audio.volume = clamp01(audio.volume - FADE_STEP);
          return;
        }

        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;

        audio.src = targetSrc;
        audio.loop = true;
        audio.volume = 0;

        if (canPlayRef()) {
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
      }, FADE_INTERVAL_MS);
    } else {
      audio.volume = targetVolume;
      if (canPlayRef() && audio.paused) {
        audio.play().catch(() => {});
      }
    }
  }, [
    dog?.stats?.happiness,
    dog?.stats?.energy,
    dog?.adoptedAt,
    settings?.audio?.enabled,
    settings?.audio?.musicEnabled,
    settings?.audio?.masterVolume,
    settings?.audio?.musicVolume,
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
    };
  }, []);

  return null;
}
