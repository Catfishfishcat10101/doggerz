// src/config/seasons.js

/**
 * Seasons Configuration
 * Centralized "seasons" map controlling palette, copy variants, and assets
 * Premium cozy storybook aesthetic
 */

/**
 * Season definitions with dates, palettes, and assets
 */
export const SEASONS = {
  SPRING: {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    months: [3, 4, 5], // March, April, May
    palette: {
      primary: '#FF6B9D',
      secondary: '#FFD93D',
      background: '#FFF8F0',
      accent: '#4ECDC4',
      text: '#2C3E50',
      cardBg: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #FFE5EC 0%, #FFF8F0 100%)'
    },
    copyVariants: {
      greeting: ['Hello, sunshine!', 'Spring is in the air!', 'Fresh beginnings await!'],
      farewell: ['Until tomorrow!', 'Keep blooming!', 'See you soon!'],
      tone: 'cheerful'
    },
    assets: {
      background: '/assets/backgrounds/spring-meadow.png',
      particles: 'petals',
      iconSet: 'pastel',
      uiTheme: 'light-warm'
    },
    ambiance: {
      sounds: ['/sounds/ambient/birds-spring.mp3', '/sounds/ambient/gentle-breeze.mp3'],
      effects: ['floating-petals', 'butterflies']
    }
  },

  SUMMER: {
    id: 'summer',
    name: 'Summer',
    emoji: '☀️',
    months: [6, 7, 8], // June, July, August
    palette: {
      primary: '#FF8C42',
      secondary: '#FFE66D',
      background: '#FFFDF7',
      accent: '#4ECDC4',
      text: '#3E2723',
      cardBg: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #FFF4DB 0%, #FFFDF7 100%)'
    },
    copyVariants: {
      greeting: ['Good morning, adventurer!', 'Let\'s play!', 'The sun is calling!'],
      farewell: ['Stay cool!', 'Dream of adventures!', 'Tomorrow\'s another day!'],
      tone: 'energetic'
    },
    assets: {
      background: '/assets/backgrounds/summer-park.png',
      particles: 'fireflies',
      iconSet: 'bright',
      uiTheme: 'light-bright'
    },
    ambiance: {
      sounds: ['/sounds/ambient/summer-day.mp3', '/sounds/ambient/distant-waves.mp3'],
      effects: ['sun-rays', 'heat-shimmer']
    }
  },

  AUTUMN: {
    id: 'autumn',
    name: 'Autumn',
    emoji: '🍂',
    months: [9, 10, 11], // September, October, November
    palette: {
      primary: '#D97642',
      secondary: '#E8A87C',
      background: '#FFF8F0',
      accent: '#C85A54',
      text: '#3E2723',
      cardBg: '#FFFBF5',
      gradient: 'linear-gradient(135deg, #FFECD1 0%, #FFF8F0 100%)'
    },
    copyVariants: {
      greeting: ['Cozy greetings!', 'Fall is beautiful!', 'Welcome back!'],
      farewell: ['Stay warm!', 'Rest well!', 'Until next time!'],
      tone: 'warm'
    },
    assets: {
      background: '/assets/backgrounds/autumn-forest.png',
      particles: 'leaves',
      iconSet: 'warm',
      uiTheme: 'warm-cozy'
    },
    ambiance: {
      sounds: ['/sounds/ambient/autumn-wind.mp3', '/sounds/ambient/rustling-leaves.mp3'],
      effects: ['falling-leaves', 'wind-gusts']
    }
  },

  WINTER: {
    id: 'winter',
    name: 'Winter',
    emoji: '❄️',
    months: [12, 1, 2], // December, January, February
    palette: {
      primary: '#6B7FFF',
      secondary: '#9BB0FF',
      background: '#F5F8FF',
      accent: '#7B68EE',
      text: '#2C3E50',
      cardBg: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #E6F2FF 0%, #F5F8FF 100%)'
    },
    copyVariants: {
      greeting: ['Warm welcome!', 'Hello, friend!', 'Cozy morning!'],
      farewell: ['Stay cozy!', 'Sweet dreams!', 'Bundle up!'],
      tone: 'gentle'
    },
    assets: {
      background: '/assets/backgrounds/winter-wonderland.png',
      particles: 'snow',
      iconSet: 'cool',
      uiTheme: 'light-cool'
    },
    ambiance: {
      sounds: ['/sounds/ambient/winter-wind.mp3', '/sounds/ambient/fireplace.mp3'],
      effects: ['falling-snow', 'frost-sparkle']
    }
  }
};

/**
 * Get current season based on month
 */
export function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  
  for (const season of Object.values(SEASONS)) {
    if (season.months.includes(month)) {
      return season;
    }
  }
  
  return SEASONS.SPRING; // Fallback
}

/**
 * Get season by ID
 */
export function getSeasonById(id) {
  return Object.values(SEASONS).find(s => s.id === id) || SEASONS.SPRING;
}

/**
 * Get random copy variant
 */
export function getCopyVariant(season, key) {
  const variants = season.copyVariants[key];
  if (!variants || !Array.isArray(variants)) return '';
  return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Apply season palette to CSS variables
 */
export function applySeasonPalette(season) {
  const { palette } = season;
  const root = document.documentElement;
  
  root.style.setProperty('--season-primary', palette.primary);
  root.style.setProperty('--season-secondary', palette.secondary);
  root.style.setProperty('--season-background', palette.background);
  root.style.setProperty('--season-accent', palette.accent);
  root.style.setProperty('--season-text', palette.text);
  root.style.setProperty('--season-card-bg', palette.cardBg);
  root.style.setProperty('--season-gradient', palette.gradient);
}

export default {
  SEASONS,
  getCurrentSeason,
  getSeasonById,
  getCopyVariant,
  applySeasonPalette
};
