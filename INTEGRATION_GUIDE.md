# UX/Visual Overhaul - Integration Guide

This document explains how to integrate the new UX components created during the visual overhaul into the Doggerz application.

## Components Created

### Journal System

#### 1. DearHoomanLetter (`src/components/journal/DearHoomanLetter.jsx`)
Individual journal entry displayed as a heartfelt letter with "Dear Hooman..." styling.

**Usage:**
```jsx
import DearHoomanLetter from '@/components/journal/DearHoomanLetter.jsx';

<DearHoomanLetter
  entry={journalEntry}
  isExpanded={expandedId === entry.id}
  onToggle={() => toggleExpand(entry.id)}
/>
```

#### 2. JournalTimeline (`src/components/journal/JournalTimeline.jsx`)
Timeline/flipbook display for journal entries. **Already integrated** in `MoodAndJournalPanel.jsx`.

**Usage:**
```jsx
import JournalTimeline from '@/components/journal/JournalTimeline.jsx';
import { selectDogJournal } from '@/redux/dogSlice.js';

const journal = useSelector(selectDogJournal);

<JournalTimeline journal={journal} maxVisible={5} />
```

### Narrative Components

#### 3. GoodbyeLetter (`src/components/narrative/GoodbyeLetter.jsx`)
Emotional goodbye letter for runaway/neglect scenarios.

**Integration Example:**
```jsx
import GoodbyeLetter from '@/components/narrative/GoodbyeLetter.jsx';
import { useState } from 'react';

const [showGoodbye, setShowGoodbye] = useState(false);

// Trigger when neglect is detected (narrative layer only)
useEffect(() => {
  // Check neglect conditions in your game logic
  const isNeglected = checkNeglectConditions();
  if (isNeglected) {
    setShowGoodbye(true);
  }
}, [/* dependencies */]);

// Render
{showGoodbye && (
  <GoodbyeLetter
    dogName={dog.name}
    reason="lonely" // or "neglected", "scared"
    onClose={() => setShowGoodbye(false)}
    onRedemption={() => {
      // Handle redemption logic
      setShowGoodbye(false);
    }}
  />
)}
```

### Memorial Components

#### 4. RainbowBridgeMemorial (`src/components/memorial/RainbowBridgeMemorial.jsx`)
Multi-step memorial experience for natural senior passings.

**Integration in RainbowBridge.jsx:**
```jsx
import RainbowBridgeMemorial from '@/components/memorial/RainbowBridgeMemorial.jsx';
import { selectDogJournal } from '@/redux/dogSlice.js';

const [showMemorial, setShowMemorial] = useState(false);
const journal = useSelector(selectDogJournal);
const memories = journal?.entries ?? [];

// Trigger memorial
<button onClick={() => setShowMemorial(true)}>
  Begin the memorial
</button>

// Render
{showMemorial && (
  <RainbowBridgeMemorial
    dogName={dog.name}
    bondValue={bondValue}
    memories={memories}
    onComplete={() => {
      // Update Redux state
      dispatch(completeRainbowBridge({ now: Date.now() }));
      setShowMemorial(false);
    }}
  />
)}
```

### Visual Effects

#### 5. PawPrintTrail (`src/components/effects/PawPrintTrail.jsx`)
Adorable paw prints that fade behind the dog as it moves.

**Integration in MainGame.jsx:**
```jsx
import PawPrintTrail from '@/components/effects/PawPrintTrail.jsx';

// In your game render
<PawPrintTrail isActive={dogIntent === 'walk' || dogIntent === 'play'} />
```

#### 6. CelebrationBurst (`src/components/effects/CelebrationBurst.jsx`)
Particle burst for achievements and celebrations.

**Integration:**
```jsx
import CelebrationBurst from '@/components/effects/CelebrationBurst.jsx';
import { useState } from 'react';

const [showCelebration, setShowCelebration] = useState(false);

// Trigger on level up or achievement
useEffect(() => {
  if (justLeveledUp) {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  }
}, [justLeveledUp]);

<CelebrationBurst 
  isActive={showCelebration} 
  type="confetti" // or "hearts", "stars", "sparkles"
/>
```

#### 7. MoodBackgroundTint (`src/components/effects/MoodBackgroundTint.jsx`)
Subtle background color shifts based on dog's mood.

**Integration in MainGame.jsx:**
```jsx
import MoodBackgroundTint from '@/components/effects/MoodBackgroundTint.jsx';
import { selectDog } from '@/redux/dogSlice.js';

const dog = useSelector(selectDog);
const currentMood = dog?.mood?.current || 'content';

// In your stage/background rendering
<div className="relative">
  <MoodBackgroundTint mood={currentMood} intensity={0.15} />
  {/* Other background elements */}
</div>
```

#### 8. WeatherReaction (`src/components/effects/WeatherReaction.jsx`)
Dog reacts to weather with cute animations.

**Integration in MainGame.jsx:**
```jsx
import WeatherReaction from '@/components/effects/WeatherReaction.jsx';
import { selectWeatherCondition } from '@/redux/weatherSlice.js';

const weather = useSelector(selectWeatherCondition);

<WeatherReaction 
  weather={weather}
  onReactionComplete={() => {
    // Optional: add journal entry about the reaction
  }}
/>
```

### Engagement Features

#### 9. PhotoMode (`src/components/features/PhotoMode.jsx`)
Capture and share dog moments.

**Integration in MainGame.jsx:**
```jsx
import PhotoMode from '@/components/features/PhotoMode.jsx';

<PhotoMode
  dogName={dog.name}
  onCapture={(photo) => {
    // Save photo metadata to journal or memories
    console.log('Photo captured:', photo);
  }}
/>
```

#### 10. DailySurprise (`src/components/features/DailySurprise.jsx`)
Daily reward system for engagement.

**Integration in Game.jsx or MainGame.jsx:**
```jsx
import DailySurprise from '@/components/features/DailySurprise.jsx';

<DailySurprise
  dogName={dog.name}
  onClaim={(surprise) => {
    // Apply the reward based on surprise.id
    switch (surprise.id) {
      case 'bonus_xp':
        dispatch(addXP({ amount: 50 }));
        break;
      case 'extra_coins':
        dispatch(addCoins({ amount: 100 }));
        break;
      // ... handle other rewards
    }
  }}
/>
```

## CSS Animations

### New Animation Classes

All new animations are defined in `src/index.css` and can be used via Tailwind classes:

```jsx
// Fade in
<div className="animate-fadeIn">...</div>

// Slide in from bottom
<div className="animate-slideInUp">...</div>

// Shimmer loading
<div className="animate-shimmer">...</div>

// Gentle bounce
<div className="animate-gentleBounce">...</div>

// Pulse glow
<div className="animate-pulseGlow">...</div>

// Wiggle
<div className="animate-wiggle">...</div>

// Float
<div className="animate-float">...</div>

// Heartbeat
<div className="animate-heartbeat">...</div>

// Hover effects
<button className="hover-lift">...</button>
<button className="hover-glow">...</button>
```

### Custom Scrollbars

Apply to scrollable containers:

```jsx
<div className="scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
  {/* Scrollable content */}
</div>
```

## Important Notes

### No Logic Changes
All components are **pure UI/UX layers**. They don't modify Redux state directly except where explicitly designed to (like the memorial completion callback).

### Accessibility
- All animations respect `prefers-reduced-motion`
- Focus states are properly managed
- ARIA labels are included where appropriate

### Performance
- Components use React hooks efficiently
- Animations are GPU-accelerated where possible
- `will-change` is used sparingly to avoid performance issues

### Testing
- Run `npm run lint` to ensure no warnings
- Run `npm run build` to verify successful build
- Test on multiple devices/browsers for compatibility

## Next Steps

To fully integrate these components:

1. **Choose where to add each component** based on your game flow
2. **Hook up Redux actions** where components trigger state changes
3. **Customize content** - adjust letter text, celebration types, etc.
4. **Test the complete flow** from trigger to completion
5. **Adjust styling** if needed to match your exact vision

## Component Files Summary

- `src/components/journal/` - Journal letter components ✅
- `src/components/narrative/` - Goodbye letter ✅
- `src/components/memorial/` - Rainbow Bridge memorial ✅
- `src/components/effects/` - Visual effects (paw prints, celebrations, etc.) ✅
- `src/components/features/` - Engagement features (photo mode, daily surprise) ✅
- `src/index.css` - New CSS animations and utilities ✅
- `src/features/game/MoodAndJournalPanel.jsx` - Updated to use new journal timeline ✅
