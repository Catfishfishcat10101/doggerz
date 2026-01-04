// src/utils/vibeEngine.js

/**
 * Vibe Engine - Computes ambient mood based on time, weather, and streak
 * Creates a premium, cozy storybook atmosphere
 */

/**
 * Time of day periods with emotional qualities
 */
const TIME_PERIODS = {
  DAWN: { start: 5, end: 7, mood: 'hopeful', palette: 'sunrise' },
  MORNING: { start: 7, end: 12, mood: 'energetic', palette: 'bright' },
  AFTERNOON: { start: 12, end: 17, mood: 'content', palette: 'warm' },
  DUSK: { start: 17, end: 20, mood: 'peaceful', palette: 'sunset' },
  EVENING: { start: 20, end: 23, mood: 'cozy', palette: 'twilight' },
  NIGHT: { start: 23, end: 5, mood: 'dreamy', palette: 'moonlight' }
};

/**
 * Weather impact on vibe
 */
const WEATHER_VIBES = {
  Clear: { mood: 'joyful', modifier: 1.2 },
  Clouds: { mood: 'calm', modifier: 1.0 },
  Rain: { mood: 'cozy', modifier: 0.9 },
  Snow: { mood: 'magical', modifier: 1.1 },
  Thunderstorm: { mood: 'dramatic', modifier: 0.7 },
  Drizzle: { mood: 'gentle', modifier: 0.95 },
  Mist: { mood: 'mysterious', modifier: 0.85 }
};

/**
 * Streak milestones and their emotional impact
 */
const STREAK_TIERS = [
  { min: 0, max: 2, mood: 'beginning', intensity: 0.5 },
  { min: 3, max: 6, mood: 'building', intensity: 0.7 },
  { min: 7, max: 13, mood: 'committed', intensity: 0.85 },
  { min: 14, max: 29, mood: 'dedicated', intensity: 1.0 },
  { min: 30, max: 99, mood: 'devoted', intensity: 1.2 },
  { min: 100, max: Infinity, mood: 'legendary', intensity: 1.5 }
];

/**
 * Get current time period
 */
export function getTimePeriod(hour = new Date().getHours()) {
  for (const [key, period] of Object.entries(TIME_PERIODS)) {
    if (period.start <= period.end) {
      if (hour >= period.start && hour < period.end) return { key, ...period };
    } else {
      // Handle night wrapping around midnight
      if (hour >= period.start || hour < period.end) return { key, ...period };
    }
  }
  return { key: 'MORNING', ...TIME_PERIODS.MORNING };
}

/**
 * Get weather vibe
 */
export function getWeatherVibe(weatherCondition = 'Clear') {
  return WEATHER_VIBES[weatherCondition] || WEATHER_VIBES.Clear;
}

/**
 * Get streak tier
 */
export function getStreakTier(streak = 0) {
  return STREAK_TIERS.find(tier => streak >= tier.min && streak <= tier.max) || STREAK_TIERS[0];
}

/**
 * Compute overall vibe state
 * @param {Object} params - { weather, streak, hour }
 * @returns {Object} - { mood, intensity, palette, timeKey, weatherMood, streakMood }
 */
export function computeVibeState({ weather = 'Clear', streak = 0, hour } = {}) {
  const timePeriod = getTimePeriod(hour);
  const weatherVibe = getWeatherVibe(weather);
  const streakTier = getStreakTier(streak);

  // Combine moods with weighted priority: time > weather > streak
  const moodPriority = [
    { mood: timePeriod.mood, weight: 0.5 },
    { mood: weatherVibe.mood, weight: 0.3 },
    { mood: streakTier.mood, weight: 0.2 }
  ];

  // Compute intensity (0-2 scale)
  const baseIntensity = 1.0;
  const intensity = Math.min(2.0, 
    baseIntensity * weatherVibe.modifier * streakTier.intensity
  );

  return {
    mood: timePeriod.mood, // Primary mood from time
    intensity,
    palette: timePeriod.palette,
    timeKey: timePeriod.key,
    weatherMood: weatherVibe.mood,
    streakMood: streakTier.mood,
    moodPriority,
    timePeriod,
    weatherVibe,
    streakTier
  };
}

/**
 * Get ambient sound for current vibe
 */
export function getAmbientSound(vibeState) {
  const { timeKey, weatherMood } = vibeState;
  
  // Map to sound file paths
  const soundMap = {
    DAWN: '/sounds/ambient/birds-morning.mp3',
    MORNING: '/sounds/ambient/peaceful-day.mp3',
    AFTERNOON: '/sounds/ambient/gentle-breeze.mp3',
    DUSK: '/sounds/ambient/crickets-evening.mp3',
    EVENING: '/sounds/ambient/fireplace-crackle.mp3',
    NIGHT: '/sounds/ambient/night-ambience.mp3'
  };

  // Weather overrides
  if (weatherMood === 'cozy') return '/sounds/ambient/rain-gentle.mp3';
  if (weatherMood === 'magical') return '/sounds/ambient/snow-wind.mp3';
  if (weatherMood === 'dramatic') return '/sounds/ambient/thunder-distant.mp3';

  return soundMap[timeKey] || soundMap.MORNING;
}

/**
 * Get palette colors for current vibe
 */
export function getPaletteColors(palette) {
  const palettes = {
    sunrise: {
      primary: '#FF6B6B',
      secondary: '#FFD93D',
      background: '#FFF4E6',
      text: '#2C3E50'
    },
    bright: {
      primary: '#4ECDC4',
      secondary: '#FFE66D',
      background: '#F7FFF7',
      text: '#2C3E50'
    },
    warm: {
      primary: '#FF8C42',
      secondary: '#FFD93D',
      background: '#FFF8E7',
      text: '#3E2723'
    },
    sunset: {
      primary: '#FF6B9D',
      secondary: '#FFA07A',
      background: '#FFF0F5',
      text: '#4A4A4A'
    },
    twilight: {
      primary: '#7B68EE',
      secondary: '#9370DB',
      background: '#F0E6FF',
      text: '#2C3E50'
    },
    moonlight: {
      primary: '#6B7FFF',
      secondary: '#9BB0FF',
      background: '#E6EFFF',
      text: '#2C3E50'
    }
  };

  return palettes[palette] || palettes.bright;
}

export default {
  getTimePeriod,
  getWeatherVibe,
  getStreakTier,
  computeVibeState,
  getAmbientSound,
  getPaletteColors
};
