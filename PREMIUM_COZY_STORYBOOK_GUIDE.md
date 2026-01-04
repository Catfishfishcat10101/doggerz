# Premium Cozy Storybook Implementation Guide

## Overview

This document describes the premium cozy storybook features implemented for Doggerz, transforming the app into a warm, emotionally engaging experience with time-of-day ambiance, seasonal themes, and rare events.

---

## Core Systems

### 1. Vibe Engine (`src/utils/vibeEngine.js`)

Computes ambient mood based on time, weather, and streak. Creates dynamic atmosphere.

**Features:**
- 6 time periods (Dawn, Morning, Afternoon, Dusk, Evening, Night)
- Weather-based mood modifiers
- Streak-based intensity scaling
- Palette color generation
- Ambient sound selection

**Usage:**
```javascript
import { computeVibeState, getPaletteColors } from '@/utils/vibeEngine.js';

const vibe = computeVibeState({ weather: 'Clear', streak: 7 });
// Returns: { mood, intensity, palette, timeKey, weatherMood, streakMood }

const colors = getPaletteColors(vibe.palette);
// Returns: { primary, secondary, background, accent, text }
```

### 2. Rare Events System (`src/utils/rareEvents.js`)

Lightweight event scheduler with rarity tiers for "Howl Moments" and surprises.

**Event Types:**
- 🌕 Moon events (Full Moon Howl, Blood Moon)
- ⏰ Time events (Golden Hour, Witching Hour)
- 🌦️ Weather events (Rainbow, First Snow)
- 🔥 Streak events (Perfect Week, Centennial)
- ✨ Random surprises (Shooting Star, Lucky Find)

**Rarity Tiers:**
- Common (20%)
- Uncommon (10%)
- Rare (5%)
- Epic (2%)
- Legendary (0.5%)
- Mythic (0.1%)

**Usage:**
```javascript
import { checkRareEvents, getEventHistory } from '@/utils/rareEvents.js';

const events = checkRareEvents(gameState);
// Returns array of triggered events with rewards

const history = getEventHistory();
// Returns last 100 events from localStorage
```

### 3. Seasons System (`src/config/seasons.js`)

Centralized seasonal configuration controlling palettes, copy variants, and assets.

**Seasons:**
- 🌸 Spring (March-May): Cherry blossoms, cheerful
- ☀️ Summer (June-August): Bright, energetic
- 🍂 Autumn (September-November): Warm, cozy
- ❄️ Winter (December-February): Cool, gentle

**Features:**
- Dynamic palettes
- Copy variants (greetings, farewells)
- Asset paths (backgrounds, particles)
- Ambient sounds per season
- Visual effects (petals, leaves, snow, fireflies)

**Usage:**
```javascript
import { getCurrentSeason, applySeasonPalette } from '@/config/seasons.js';

const season = getCurrentSeason();
applySeasonPalette(season); // Applies CSS variables

// Access season properties
console.log(season.palette.primary); // Color
console.log(season.copyVariants.greeting); // Array of greetings
```

---

## Custom Hooks

### 1. useVibeState (`src/hooks/useVibeState.js`)

Computes and maintains current vibe state with automatic updates.

**Returns:**
```javascript
{
  mood: 'peaceful',
  intensity: 1.2,
  palette: 'sunset',
  timeKey: 'DUSK',
  weatherMood: 'calm',
  streakMood: 'committed'
}
```

**Usage:**
```jsx
import { useVibeState } from '@/hooks/useVibeState.js';

function MyComponent() {
  const vibe = useVibeState();
  
  return (
    <div style={{ backgroundColor: vibe.palette === 'sunset' ? '#FFF0F5' : '#FFF' }}>
      Current mood: {vibe.mood}
    </div>
  );
}
```

### 2. useAmbientAudio (`src/hooks/useAmbientAudio.js`)

Manages ambient background audio with soft crossfades.

**Returns:**
```javascript
{
  playing: boolean,
  toggle: () => void,
  setVolume: (vol) => void,
  volume: number,
  currentTrack: string
}
```

**Usage:**
```jsx
import { useVibeState } from '@/hooks/useVibeState.js';
import { useAmbientAudio } from '@/hooks/useAmbientAudio.js';

function AudioControls() {
  const vibe = useVibeState();
  const audio = useAmbientAudio(vibe, { enabled: false, volume: 0.3 });
  
  return (
    <div>
      <button onClick={audio.toggle}>
        {audio.playing ? '🔊' : '🔇'}
      </button>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1"
        value={audio.volume}
        onChange={(e) => audio.setVolume(Number(e.target.value))}
      />
    </div>
  );
}
```

### 3. useRareEvent (`src/hooks/useRareEvent.js`)

Monitors for rare events and provides notifications.

**Returns:**
```javascript
{
  activeEvent: Event | null,
  eventHistory: Event[],
  dismissEvent: () => void,
  checkNow: () => void,
  lastCheck: number
}
```

**Usage:**
```jsx
import { useRareEvent } from '@/hooks/useRareEvent.js';

function RareEventNotification() {
  const { activeEvent, dismissEvent } = useRareEvent();
  
  if (!activeEvent) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md">
        <div className="text-6xl mb-4 text-center">✨</div>
        <h2 className="text-2xl font-bold mb-2">{activeEvent.name}</h2>
        <p className="text-gray-600 mb-4">{activeEvent.description}</p>
        <div className="text-sm text-purple-600 mb-4">
          Rarity: {activeEvent.rarityInfo.label}
        </div>
        {activeEvent.rewards && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
            <strong>Rewards:</strong>
            {activeEvent.rewards.xp && <div>+{activeEvent.rewards.xp} XP</div>}
            {activeEvent.rewards.coins && <div>+{activeEvent.rewards.coins} coins</div>}
          </div>
        )}
        <button 
          onClick={dismissEvent}
          className="w-full bg-purple-600 text-white py-2 rounded-lg"
        >
          Claim Reward
        </button>
      </div>
    </div>
  );
}
```

---

## Premium UI Components

### 1. MoodDial (`src/components/ui/MoodDial.jsx`)

Radial meter showing energy, hunger, and curiosity with SVG animations.

**Props:**
- `energy`: number (0-100)
- `hunger`: number (0-100)
- `curiosity`: number (0-100)
- `size`: 'sm' | 'md' | 'lg'

**Usage:**
```jsx
import { MoodDial } from '@/components/ui/MoodDial.jsx';

<MoodDial energy={75} hunger={60} curiosity={85} size="md" />
```

### 2. BarkStream (`src/components/ui/BarkStream.jsx`)

Activity stream showing playful micro-events.

**Props:**
- `events`: Array of event objects
- `compact`: boolean (compact mode for header)
- `maxVisible`: number (default 3)

**Usage:**
```jsx
import { BarkStream } from '@/components/ui/BarkStream.jsx';

// Full version
<BarkStream events={activityLog} maxVisible={5} />

// Compact version for header
<BarkStream compact={true} />
```

### 3. SniffCard (`src/components/ui/SniffCard.jsx`)

Interactive card with hover scent trails and particle effects.

**Props:**
- `title`: string (required)
- `description`: string
- `icon`: ReactNode
- `scent`: 'vanilla' | 'lavender' | 'pine' | 'ocean' | 'rose' | 'mint'
- `onClick`: function
- `locked`: boolean
- `children`: ReactNode

**Usage:**
```jsx
import { SniffCard } from '@/components/ui/SniffCard.jsx';

<SniffCard
  title="Morning Walk"
  description="Take your pup for a stroll!"
  icon="🚶"
  scent="pine"
  onClick={() => handleWalk()}
  locked={energy < 20}
>
  <div>Energy required: 20+</div>
</SniffCard>
```

---

## New CSS Animations

### Premium Cozy Storybook Animations

**Gentle interactions:**
- `.animate-bounce-gentle` - Soft bouncing
- `.animate-pulse-slow` - Atmospheric pulsing
- `.animate-float-up` - Particles floating upward
- `.animate-ambient-glow` - Cozy glow effect

**Seasonal particles:**
- `.animate-floating-petals` - Spring cherry blossoms
- `.animate-falling-leaves` - Autumn leaves
- `.animate-falling-snow` - Winter snowflakes
- `.animate-firefly` - Summer fireflies

**Storybook effects:**
- `.animate-page-turn` - Page flip animation
- `.animate-slide-in-right` - Activity stream items

**All animations respect `prefers-reduced-motion`**

---

## Integration Examples

### Full Vibe-Aware Page

```jsx
import React from 'react';
import { useVibeState } from '@/hooks/useVibeState.js';
import { useAmbientAudio } from '@/hooks/useAmbientAudio.js';
import { useRareEvent } from '@/hooks/useRareEvent.js';
import { MoodDial } from '@/components/ui/MoodDial.jsx';
import { BarkStream } from '@/components/ui/BarkStream.jsx';
import { getPaletteColors } from '@/utils/vibeEngine.js';

function CozyGamePage() {
  const vibe = useVibeState();
  const audio = useAmbientAudio(vibe);
  const { activeEvent, dismissEvent } = useRareEvent();
  const colors = getPaletteColors(vibe.palette);
  
  return (
    <div 
      className="min-h-screen transition-colors duration-1000"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header with BarkStream */}
      <header className="p-4">
        <BarkStream compact={true} />
        <button onClick={audio.toggle} className="ml-4">
          {audio.playing ? '🔊' : '🔇'}
        </button>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: colors.text }}>
          {vibe.mood === 'peaceful' ? 'Enjoy the evening' : 'Hello, friend!'}
        </h1>
        
        <MoodDial energy={75} hunger={60} curiosity={85} size="lg" />
      </main>
      
      {/* Rare event notification */}
      {activeEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md animate-bounceIn">
            <h2>{activeEvent.name}</h2>
            <p>{activeEvent.description}</p>
            <button onClick={dismissEvent}>Claim</button>
          </div>
        </div>
      )}
      
      {/* Seasonal particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {vibe.palette === 'sunrise' && (
          <>
            <div className="absolute animate-floating-petals" style={{left: '10%', animationDelay: '0s'}}>🌸</div>
            <div className="absolute animate-floating-petals" style={{left: '30%', animationDelay: '2s'}}>🌸</div>
            <div className="absolute animate-floating-petals" style={{left: '60%', animationDelay: '4s'}}>🌸</div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## Next Steps

Features to implement:
1. **Enhanced Landing Page** - Live kennel board with time-of-day shifts
2. **Adopt-a-Vibe Flow** - Personality quiz customizing palette
3. **Weather Diorama** - Animated skyline with dog silhouette
4. **Pack Walks** - Streak-based daily sessions
5. **Mini-games** - Tug-of-war, Fetch loop, Scent trails

---

## File Structure

```
src/
├── utils/
│   ├── vibeEngine.js          # Core vibe computation
│   └── rareEvents.js          # Event scheduling system
├── config/
│   └── seasons.js             # Seasonal configurations
├── hooks/
│   ├── useVibeState.js        # Vibe state hook
│   ├── useAmbientAudio.js     # Audio management hook
│   └── useRareEvent.js        # Event monitoring hook
├── components/
│   └── ui/
│       ├── MoodDial.jsx       # Radial stat meter
│       ├── BarkStream.jsx     # Activity stream
│       └── SniffCard.jsx      # Interactive card
└── index.css                  # Premium animations
```

---

## Philosophy

The premium cozy storybook aesthetic prioritizes:
- ✨ **Emotional engagement** through time-aware ambiance
- 🎨 **Visual warmth** with seasonal palettes
- 🎵 **Ambient soundscapes** that evolve throughout the day
- ✨ **Rare delight** with surprising events
- 📖 **Storybook charm** in every interaction

Every element should feel handcrafted, warm, and alive.
