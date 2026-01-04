/** @format */

// src/config/dynamicMusic.js
// Data-driven soundtrack rules + track metadata.

export const DYNAMIC_MUSIC_TRACKS = Object.freeze({
  calmDay: {
    id: "calm-day",
    label: "Calm Loop",
    src: "/audio/music/calm-loop.mp3",
  },
  eveningCalm: {
    id: "evening-calm",
    label: "Gravity Turn (Calm)",
    src: "/audio/music/evening-calm.mp3",
  },
  lowMood: {
    id: "low-mood",
    label: "Town Uneasy",
    src: "/audio/music/low-mood.mp3",
  },
  playful: {
    id: "playful-adventure",
    label: "Happy Adventure Loop",
    src: "/audio/music/playful-adventure.mp3",
  },
  rain: {
    id: "rain-loop",
    label: "Rain Gutter Loop",
    src: "/audio/music/rain-loop.mp3",
  },
  night: {
    id: "night-shrine",
    label: "Dark Shrine Loop",
    src: "/audio/music/night-shrine.mp3",
  },
});

export const DYNAMIC_MUSIC_CONFIG = Object.freeze({
  version: 1,
  fadeMs: 1400,
  minSceneMs: 20000,
  minTrackMs: 18000,
  fallbackSceneId: "day",
  scenes: [
    {
      id: "sleep",
      label: "Sleep",
      when: { isAsleep: true },
      trackIds: ["night"],
      volume: 0.55,
    },
    {
      id: "training",
      label: "Training",
      when: { activity: ["train"] },
      trackIds: ["playful"],
    },
    {
      id: "play",
      label: "Play",
      when: { activity: ["play"] },
      trackIds: ["playful"],
    },
    {
      id: "rainy",
      label: "Rain",
      when: { weather: ["rain"] },
      trackIds: ["rain"],
      volume: 0.85,
    },
    {
      id: "snowy",
      label: "Snow",
      when: { weather: ["snow"] },
      trackIds: ["eveningCalm"],
      volume: 0.85,
    },
    {
      id: "low-mood",
      label: "Low Mood",
      when: { moodTone: ["low"] },
      trackIds: ["lowMood"],
      volume: 0.8,
    },
    {
      id: "night",
      label: "Night",
      when: { timeOfDay: ["night"] },
      trackIds: ["night"],
      volume: 0.75,
    },
    {
      id: "evening",
      label: "Evening",
      when: { timeOfDay: ["dusk", "evening"] },
      trackIds: ["eveningCalm"],
      volume: 0.8,
    },
    {
      id: "day",
      label: "Day",
      when: { timeOfDay: ["morning", "afternoon", "dawn"] },
      trackIds: ["calmDay"],
    },
  ],
});
