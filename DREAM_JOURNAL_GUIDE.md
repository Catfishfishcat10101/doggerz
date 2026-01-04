# Dream Journal Implementation Guide

## Overview

The **Dream Journal** is a whimsical feature that generates context-aware dreams when your virtual dog sleeps. Dreams are based on recent activities, current mood, and needs—making sleep meaningful rather than just a wait state.

## Component Location

**File:** `src/features/dreams/DreamJournal.jsx`  
**Integration:** `src/features/game/MainGame.jsx`

---

## Features

### 🌟 Dream Types

1. **Happy Dreams** - Based on positive activities
   - 🎾 Endless Fetch Field
   - 🦴 Treat Mountain
   - 🌸 Flower Garden

2. **Adventure Dreams** - From recent explorations
   - 🚶 Adventure Trail (after walks)
   - 🎪 Trick Champion (after training)

3. **Comforting Dreams** - Processing experiences
   - 🏥 The Kind Vet (after vet visits)
   - ☀️ Sunny Nap Spot (peaceful default)

4. **Nightmares** 😰 - When anxious or neglected
   - 🌫️ Lost in the Fog
   - 🥣 The Empty Bowl
   - 🏠 Alone Forever

5. **Prophetic Dreams** ✨ - Rare (5% chance)
   - 🌟 The Golden Treat
   - 🌈 Rainbow Path
   - 🌙 Moonlit Promise

---

## How It Works

### Trigger Conditions

Dreams appear when:
- Dog is **asleep** (`isAsleep === true`)
- 3-second delay after falling asleep
- Dreams persist until dog wakes up

### Dream Generation Logic

```javascript
// Priority order:
1. Nightmare (if anxious OR happiness < 30 OR hunger < 20)
2. Prophetic Dream (5% random chance)
3. Activity-based Dream (from recent journal entries)
4. Default Peaceful Dream
```

### Activity Detection

Dreams analyze the last 10 journal entries for keywords:
- **Fetch/Play** → Endless Fetch Field
- **Vet/Checkup** → Kind Vet
- **Walk** → Adventure Trail
- **Train/Trick** → Trick Champion

### Journal Integration

- **Auto-save:** 70% of dreams saved to journal automatically
- **Type:** `'dream'`
- **Includes:** Title, description, dog's message, mood tag

---

## Integration Example

### In MainGame.jsx

```jsx
import DreamJournal from '@/features/dreams/DreamJournal.jsx';

// In the component:
{adopted && <DreamJournal isAsleep={isAsleep} />}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isAsleep` | boolean | Yes | Whether dog is currently asleep |
| `onClose` | function | No | Callback when dream is dismissed |

---

## Visual Design

### Pastel Color Palettes

Each dream type has unique gradient colors:

- **Happy:** `from-green-300 to-emerald-500`
- **Adventure:** `from-amber-300 to-orange-500`
- **Peaceful:** `from-yellow-200 to-orange-300`
- **Nightmare:** `from-gray-600 to-gray-800`
- **Prophetic:** `from-yellow-400 to-amber-600`

### Animations

1. **Entrance:** Scale from 75% to 100%, rotate from 3° to 0°
2. **Floating Particles:** 8 white particles with random positions
3. **Badge Pulse:** Prophetic dreams have pulsing badge
4. **Smooth Transitions:** 500-700ms duration

### UI Elements

- **Dream Type Badge:** Floating icon (top-right)
- **Rarity Indicator:** Top-center banner for rare/nightmare dreams
- **Content Card:** Glassmorphism with backdrop blur
- **Dog's Message:** Speech bubble with 💭 icon
- **Prophecy Section:** Yellow-tinted for prophetic dreams
- **Dismiss Button:** "Sweet Dreams 💤"

---

## Sample Dreams

### Happy Dream (After Playing Fetch)

```
Title: 🎾 Endless Fetch Field
Description: "Fluffy dreams of a magical field where balls multiply endlessly! 
              Every throw brings more balls!"
Message: "The balls just kept coming! It was the best dream ever! 🎾✨"
Color: Green gradient
```

### Nightmare (When Hungry)

```
Title: 😱 The Empty Bowl
Description: "Fluffy dreams of an endless empty food bowl that never fills up, 
              no matter how long they wait..."
Message: "My bowl was empty forever... I was so hungry! 🥺"
Color: Dark gray gradient
```

### Prophetic Dream (Rare)

```
Title: 🌟 The Golden Treat
Description: "Fluffy dreams of a shimmering golden treat that grants a wish. 
              What could it mean?"
Message: "I saw something amazing coming... I can feel it! ✨"
Prophecy: "A special surprise is coming soon!"
Color: Golden gradient
Badge: "✨ RARE DREAM ✨" (pulsing)
```

---

## User Experience

### Dream Lifecycle

1. **Dog falls asleep** (user clicks "Rest" button)
2. **3-second delay** for realistic sleep onset
3. **Dream appears** with entrance animation
4. **User can read** the dream description and message
5. **Optional dismiss** by clicking "Sweet Dreams" button or backdrop
6. **Auto-saves** to journal (70% chance)
7. **Dream disappears** when dog wakes up

### Emotional Impact

**Makes sleeping meaningful:**
- Players look forward to seeing what dreams appear
- Dreams reflect how well they're caring for their dog
- Nightmares serve as gentle reminders to check needs
- Prophetic dreams create anticipation
- Activity-based dreams reward engagement

---

## Technical Details

### Redux State Access

```javascript
const dog = useSelector(selectDog);
const journal = dog?.journal || [];
```

### Journal Entry Structure

```javascript
dispatch(addJournalEntry({
  timestamp: Date.now(),
  type: 'dream',
  summary: `${dog.name} had a dream: ${dream.title}`,
  body: dream.description,
  moodTag: dream.type,
  dreamData: dream, // Full dream object
}));
```

### Component State

- `dream` - Current dream object (null when not dreaming)
- `isAnimating` - Controls entrance/exit animations
- `showDream` - Controls render visibility

### Performance

- **Lazy rendering:** Only renders when `isAsleep === true`
- **Automatic cleanup:** Timeouts cleared on unmount
- **No polling:** Pure event-driven updates
- **Bundle size:** ~12 KB uncompressed

---

## Customization

### Adding New Dream Types

```javascript
// In generateActivityDream function:
if (hasCustomActivity) {
  dreams.push({
    title: '🎨 Your Custom Dream',
    description: `${dog.name} dreams of...`,
    color: 'from-color-300 to-color-500',
    icon: '🎨',
    type: 'custom',
    message: `Dream message from the dog!`,
  });
}
```

### Adjusting Probabilities

```javascript
// Prophetic dream chance (default 5%)
if (Math.random() < 0.10) { // Now 10%
  return generatePropheticDream(dog);
}

// Journal save rate (default 70%)
if (Math.random() < 0.90) { // Now 90%
  // Save to journal
}
```

### Timing Adjustments

```javascript
// Dream appearance delay (default 3 seconds)
const dreamDelay = setTimeout(() => {
  // ...
}, 5000); // Now 5 seconds

// Exit animation duration (default 500ms)
setTimeout(() => {
  setShowDream(false);
}, 800); // Now 800ms
```

---

## Why It's Innovative

1. **Context-Aware:** Dreams reflect actual gameplay, not random
2. **Emotional Feedback:** Nightmares = warning, happy dreams = reward
3. **Collectible:** Dreams auto-save to journal as memories
4. **Rare Content:** Prophetic dreams create excitement
5. **Zero Wait Time:** Makes "waiting" during sleep engaging
6. **No External API:** Fully client-side, works offline
7. **Safe & Incremental:** No Redux logic changes, pure UI layer

---

## Future Enhancements

Potential additions:
- Dream collection gallery
- Achievement for rare prophetic dreams
- Dream-based rewards (unlock cosmetics)
- Share dreams on social media
- Dream patterns (recurring themes)
- Lucid dreaming mode (player influences dream)
- Dream interpretation mini-game

---

## Accessibility

- **Reduced Motion:** Respects `prefers-reduced-motion`
- **Keyboard Navigation:** Can dismiss with Escape key
- **Screen Readers:** Semantic HTML with proper ARIA labels
- **High Contrast:** Works in dark/light mode
- **Touch Friendly:** Large dismiss button and backdrop click

---

## Testing

### Manual Testing Scenarios

1. **Happy Path:** Play with dog → Rest → See fetch dream
2. **Nightmare:** Let hunger drop below 20 → Rest → See hunger nightmare
3. **Prophetic:** Keep trying until rare dream appears (5% chance)
4. **Wake Up:** Dream should disappear when clicking "Wake Up"
5. **Journal:** Check that dream appears in journal entries

### Edge Cases

- No journal entries (first sleep)
- Dog wakes up immediately
- Multiple rapid sleep cycles
- Extremely low needs
- Journal full

---

## Bundle Impact

**New Files:**
- `src/features/dreams/DreamJournal.jsx` (~12 KB)

**Modified Files:**
- `src/features/game/MainGame.jsx` (+2 lines)

**Total Impact:** ~12 KB uncompressed (~3 KB gzipped)

---

## Status

✅ **Complete & Production-Ready**

- [x] Component implemented
- [x] Integrated into MainGame
- [x] Multiple dream types
- [x] Journal auto-save
- [x] Animations and transitions
- [x] Accessibility support
- [x] Documentation complete

---

## Support

For issues or questions about the Dream Journal feature, reference:
- Component source: `src/features/dreams/DreamJournal.jsx`
- Integration point: `src/features/game/MainGame.jsx` (line ~434)
- This documentation: `DREAM_JOURNAL_GUIDE.md`
