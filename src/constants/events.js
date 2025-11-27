/**
 * @typedef {Object} EventReward
 * @property {string} id
 * @property {string} type - Reward type (toy, background, cosmetic, collar, etc.)
 * @property {string} name - Display name
 * @property {string} [rarity] - Rarity label (common, rare, legendary, etc.)
 * @property {boolean} [premium] - True if premium-only
 */

/**
 * @typedef {Object} SeasonalEvent
 * @property {string} id
 * @property {string} name
 * @property {string} startDate - ISO date string
 * @property {string} endDate - ISO date string
 * @property {EventReward[]} baseTrack
 * @property {EventReward[]} bonusTrack
 */

/**
 * List of all seasonal events (extendable)
 * @type {SeasonalEvent[]}
 */
export const SEASONAL_EVENTS = [
  {
    id: "winterfest_2025",
    name: "Winterfest 2025",
    startDate: "2025-12-15",
    endDate: "2026-01-05",
    baseTrack: [
      {
        id: "snowball_toy",
        type: "toy",
        name: "Snowball Toy",
        rarity: "common",
      },
      {
        id: "winter_bg",
        type: "background",
        name: "Winter Background",
        rarity: "rare",
      },
    ],
    bonusTrack: [
      {
        id: "ice_crown",
        type: "cosmetic",
        name: "Ice Crown",
        rarity: "legendary",
        premium: true,
      },
      {
        id: "frost_collar",
        type: "collar",
        name: "Frost Collar",
        rarity: "epic",
        premium: true,
      },
    ],
  },
  // Add future events here
];

/**
 * Get event status for a given event (active, upcoming, ended)
 * @param {SeasonalEvent} event
 * @param {Date} [now]
 * @returns {"active"|"upcoming"|"ended"}
 */
export function getEventStatus(event, now = new Date()) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

/**
 * Get all rewards for a user for a given event
 * @param {string} eventId
 * @param {boolean} isPremium
 * @returns {EventReward[]}
 */
export function getEventRewards(eventId, isPremium) {
  const event = SEASONAL_EVENTS.find((e) => e.id === eventId);
  if (!event) return [];
  return isPremium
    ? [...event.baseTrack, ...event.bonusTrack]
    : event.baseTrack;
}

// Usage: import { SEASONAL_EVENTS, getEventStatus, getEventRewards } from '@/constants/events.js'
