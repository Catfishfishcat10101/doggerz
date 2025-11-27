// Rotating limited-time cosmetics for soft coin sink
// Usage: import { ROTATING_COSMETICS, getActiveCosmetics } from '@/constants/cosmetics.js'
// Each cosmetic has: id, name, type, price, startDate, endDate, rarity

export const ROTATING_COSMETICS = [
  {
    id: "winter_bandana_2025",
    name: "Winter Bandana",
    type: "bandana",
    price: 5000, // high coin cost
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    rarity: "seasonal",
  },
  {
    id: "emerald_collar_2025",
    name: "Emerald Collar",
    type: "collar",
    price: 7500,
    startDate: "2025-11-20",
    endDate: "2025-12-10",
    rarity: "limited",
  },
  {
    id: "fireworks_bg_2026",
    name: "Fireworks Background",
    type: "background",
    price: 10000,
    startDate: "2025-12-28",
    endDate: "2026-01-05",
    rarity: "event",
  },
];

// Utility: get currently available cosmetics
export function getActiveCosmetics(now = new Date()) {
  return ROTATING_COSMETICS.filter((cos) => {
    const start = new Date(cos.startDate);
    const end = new Date(cos.endDate);
    return now >= start && now <= end;
  });
}
