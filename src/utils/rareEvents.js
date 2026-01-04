// src/utils/rareEvents.js

/**
 * Rare Event System - Lightweight scheduler with rarity tiers
 * Generates "Howl Moments" and other special occurrences
 */

/**
 * Event rarity tiers with probabilities
 */
export const RARITY_TIERS = {
  COMMON: { probability: 0.20, label: 'Common', color: '#95A5A6' },
  UNCOMMON: { probability: 0.10, label: 'Uncommon', color: '#3498DB' },
  RARE: { probability: 0.05, label: 'Rare', color: '#9B59B6' },
  EPIC: { probability: 0.02, label: 'Epic', color: '#E74C3C' },
  LEGENDARY: { probability: 0.005, label: 'Legendary', color: '#F39C12' },
  MYTHIC: { probability: 0.001, label: 'Mythic', color: '#FF6B9D' }
};

/**
 * Rare event definitions
 */
export const RARE_EVENTS = [
  // Moon Events
  {
    id: 'full_moon_howl',
    name: 'Full Moon Howl',
    description: 'The moon is full and bright. Your pup feels the ancient call!',
    rarity: 'RARE',
    type: 'moon',
    rewards: { cosmetic: 'moon_collar', xp: 200 },
    conditions: (_state) => {
      const phase = getMoonPhase();
      return phase === 'full' && _state.hour >= 20 && _state.hour < 6;
    }
  },
  {
    id: 'blood_moon',
    name: 'Blood Moon',
    description: 'A crimson moon rises. Something magical is in the air...',
    rarity: 'LEGENDARY',
    type: 'moon',
    rewards: { cosmetic: 'lunar_aura', xp: 500 },
    conditions: (state) => {
      // Very rare, only on specific dates
      return false; // Placeholder - implement lunar calendar
    }
  },
  
  // Time Events
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    description: 'Perfect lighting for a memorable moment with your pup!',
    rarity: 'UNCOMMON',
    type: 'time',
    rewards: { photo_filter: 'golden', xp: 50 },
    conditions: (state) => {
      return (state.hour === 6 || state.hour === 18) && state.weather === 'Clear';
    }
  },
  {
    id: 'witching_hour',
    name: 'Witching Hour',
    description: 'The veil between worlds is thin. Your pup sees things...',
    rarity: 'EPIC',
    type: 'time',
    rewards: { cosmetic: 'ghostly_glow', xp: 300 },
    conditions: (state) => {
      return state.hour === 3 && new Date().getDay() === 6; // 3 AM on Saturday
    }
  },

  // Weather Events
  {
    id: 'rainbow_after_rain',
    name: 'Rainbow Appears',
    description: 'A beautiful rainbow emerges after the storm!',
    rarity: 'UNCOMMON',
    type: 'weather',
    rewards: { coins: 100, xp: 100 },
    conditions: (state) => {
      return state.weatherJustChanged && state.previousWeather?.includes('Rain') && state.weather === 'Clear';
    }
  },
  {
    id: 'first_snow',
    name: 'First Snow',
    description: 'Snowflakes fall for the first time! Your pup is mesmerized!',
    rarity: 'RARE',
    type: 'weather',
    rewards: { cosmetic: 'winter_scarf', xp: 200 },
    conditions: (state) => {
      return state.weather === 'Snow' && !state.hasSeenSnowThisSeason;
    }
  },

  // Streak Events
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '7 days of dedication! Your bond grows stronger!',
    rarity: 'UNCOMMON',
    type: 'streak',
    rewards: { badge: 'week_warrior', xp: 150 },
    conditions: (state) => {
      return state.streak === 7;
    }
  },
  {
    id: 'centennial',
    name: 'Centennial Bond',
    description: '100 days together! An unbreakable connection!',
    rarity: 'LEGENDARY',
    type: 'streak',
    rewards: { badge: 'century_companion', cosmetic: 'platinum_collar', xp: 1000 },
    conditions: (state) => {
      return state.streak === 100;
    }
  },

  // Random Surprises
  {
    id: 'shooting_star',
    name: 'Shooting Star',
    description: 'A star streaks across the night sky! Make a wish!',
    rarity: 'RARE',
    type: 'random',
    rewards: { wish_token: 1, xp: 150 },
    conditions: (state) => {
      return state.hour >= 21 && state.weather === 'Clear' && Math.random() < 0.01;
    }
  },
  {
    id: 'lucky_find',
    name: 'Lucky Find',
    description: 'Your pup found something shiny!',
    rarity: 'COMMON',
    type: 'random',
    rewards: { coins: 50 },
    conditions: () => Math.random() < 0.05
  }
];

/**
 * Get moon phase (simplified)
 */
export function getMoonPhase() {
  const date = new Date();
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const lunarCycle = 29.53; // days
  const phase = (dayOfYear % lunarCycle) / lunarCycle;
  
  if (phase < 0.0625 || phase >= 0.9375) return 'new';
  if (phase >= 0.4375 && phase < 0.5625) return 'full';
  if (phase >= 0.0625 && phase < 0.4375) return 'waxing';
  return 'waning';
}

/**
 * Check for rare events
 * @param {Object} state - Current game state
 * @returns {Array} - Array of triggered events
 */
export function checkRareEvents(state) {
  const triggeredEvents = [];

  for (const event of RARE_EVENTS) {
    try {
      if (event.conditions(state)) {
        const rarity = RARITY_TIERS[event.rarity];
        // Random chance based on rarity
        if (Math.random() < rarity.probability) {
          triggeredEvents.push({
            ...event,
            rarityInfo: rarity,
            triggeredAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error(`Error checking event ${event.id}:`, error);
    }
  }

  return triggeredEvents;
}

/**
 * Get next potential rare event (for teasing)
 */
export function getUpcomingEvents(_state, count = 3) {
  const upcoming = RARE_EVENTS
    .filter(event => {
      try {
        // Check if conditions could be met soon
        return !event.conditions(_state); // Not currently active
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const rarityA = RARITY_TIERS[a.rarity].probability;
      const rarityB = RARITY_TIERS[b.rarity].probability;
      return rarityB - rarityA; // More common first
    })
    .slice(0, count);

  return upcoming;
}

/**
 * Get event history (stored in localStorage)
 */
export function getEventHistory() {
  try {
    const history = localStorage.getItem('doggerz_event_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

/**
 * Save event to history
 */
export function saveEventToHistory(event) {
  try {
    const history = getEventHistory();
    history.unshift({
      ...event,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 events
    const trimmed = history.slice(0, 100);
    localStorage.setItem('doggerz_event_history', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save event history:', error);
  }
}

export default {
  RARITY_TIERS,
  RARE_EVENTS,
  getMoonPhase,
  checkRareEvents,
  getUpcomingEvents,
  getEventHistory,
  saveEventToHistory
};
