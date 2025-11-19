<!-- cspell:ignore spritesheets Shiba shiba Sploot -->

# Doggerz Spritesheet Specification

## Overview

Doggerz uses **2048x2048 PNG spritesheets** with a **16x16 grid** layout (128x128px per frame). Each life stage has a dedicated sheet.

---

## File Structure

```

public/
└── sprites/
    ├── jack_russell_puppy.png      (2048x2048, 256 frames)
    ├── jack_russell_adult.png      (2048x2048, 256 frames)
    ├── jack_russell_senior.png     (2048x2048, 256 frames)
    └── [future breeds follow same pattern]

```

---

## Frame Layout (16x16 Grid)

| Row | Animation | Frames | Start | End |
|-----|-----------|--------|-------|-----|
| 0 | Idle | 16 | 0 | 15 |
| 1 | Walk | 16 | 16 | 31 |
| 2 | Run | 16 | 32 | 47 |
| 3 | Sit | 16 | 48 | 63 |
| 4 | Lay Down | 16 | 64 | 79 |
| 5 | Eat | 16 | 80 | 95 |
| 6 | Play (Ball) | 16 | 96 | 111 |
| 7 | Play (Tug) | 16 | 112 | 127 |
| 8 | Sleep | 16 | 128 | 143 |
| 9 | Bark | 16 | 144 | 159 |
| 10 | Scratch | 16 | 160 | 175 |
| 11 | Shake | 16 | 176 | 191 |
| 12 | Potty | 16 | 192 | 207 |
| 13 | Sad | 16 | 208 | 223 |
| 14 | Excited | 16 | 224 | 239 |
| 15 | Special | 16 | 240 | 255 |

---

## Animation State Mapping

### Idle States

- **Neutral:** Idle animation (row 0)
- **Happy (>75):** Excited animation (row 14)
- **Sad (<25):** Sad animation (row 13)

### Action States

```js

const ANIMATION_MAP = {
  feeding: 'eat',      // Row 5
  playing: 'play',     // Row 6 or 7 (random)
  training: 'sit',     // Row 3
  resting: 'sleep',    // Row 8
  bathing: 'shake',    // Row 11
  walking: 'walk',     // Row 1
  barking: 'bark',     // Row 9
};

```

### Mood-Driven Behaviors

- **Hunger > 70:** Look at player, occasional bark
- **Happiness < 30:** Lay down, sad animation
- **Energy < 20:** Sleep animation (even if not resting)
- **Cleanliness < 30:** Scratch animation (fleas)

---

## Technical Specs

### Frame Dimensions

- **Total sheet:** 2048 x 2048 px
- **Per frame:** 128 x 128 px (16 frames per row/column)
- **Canvas render size:** 256 x 256 px (2x scale for retina)

### Animation Timing

- **Idle/Sleep:** 8 FPS (slow, subtle breathing)
- **Walk/Run:** 12 FPS
- **Actions (eat/play):** 10 FPS
- **Fast actions (shake/bark):** 15 FPS

### Sprite Component Integration

```jsx

// Example usage in DogSprite.jsx
<canvas
  ref={canvasRef}
  width={256}
  height={256}
  className="pixelated"
  style={{ imageRendering: 'pixelated' }}
/>

```

---

## Life Stage Visual Differences

### Puppy (0-180 game days)

- **Size:** 0.8x scale factor
- **Proportions:** Large head, short legs, floppy ears
- **Eyes:** Wide, curious expression
- **Coat:** Fluffier, softer texture

### Adult (181-2555 game days)

- **Size:** 1.0x scale (base)
- **Proportions:** Athletic, balanced
- **Eyes:** Alert, confident
- **Coat:** Sleek, defined muscle tone

### Senior (2556+ game days)

- **Size:** 0.9x scale factor
- **Proportions:** Slightly hunched posture
- **Eyes:** Gentle, wise expression
- **Coat:** Graying muzzle, slower animations (0.8x speed)

---

## Cleanliness Visual Tiers

### Fresh (100-76)

- **Base sprite** (no modifications)

### Dusty (75-51)

- **Overlay:** 10% opacity gray dust particles
- **Animation:** Occasional scratch (every 30s)

### Dirty (50-26)

- **Overlay:** 25% opacity brown dirt patches
- **Animation:** Frequent scratching (every 15s)

### Fleas (25-11)

- **Overlay:** 40% dirt + animated flea sprites (tiny black dots)
- **Animation:** Constant scratching, unhappy expression

### Mange (10-0)

- **Overlay:** 60% dirt + visible skin patches (pink areas)
- **Animation:** Sad animation loop, laying down

---

## Weather Overlays (Optional)

When weather system is active:

### Rain

- **Overlay:** Animated rain drops (separate sprite layer)
- **Dog reaction:** Shake animation after 10s exposure
- **Cleanliness:** -5/min if outside

### Snow

- **Overlay:** Falling snowflakes
- **Dog reaction:** Excited animation (jumps in snow)
- **Energy:** -10/min (cold)

### Sun

- **Overlay:** None (clear sprite)
- **Dog behavior:** Lay down animation (sunbathing)

---

## Future Breed Variations

Each breed follows the same layout but with unique art:

```

jack_russell_puppy.png
beagle_puppy.png
corgi_puppy.png
shiba_puppy.png
husky_puppy.png

...
```

### Breed-Specific Animations (Row 15)

- **Jack Russell:** Ball obsession (extra bouncy play)
- **Beagle:** Food sniffing (nose to ground)
- **Corgi:** Sploot (lay flat on belly)
- **Shiba:** Side-eye meme pose

---

## Asset Creation Guidelines

### For Artists

1. **Use consistent lighting** (top-left light source)
2. **Keep outlines thick** (2-3px black borders for readability)
3. **Limit colors** (16-color palette per breed for retro feel)
4. **Animate on 2s** (hold each frame for 2 ticks = smoother motion)
5. **Test at 256x256** (final render size)

### Color Palettes

**Jack Russell:**

- Base: `#F5E6D3` (cream)
- Markings: `#8B4513` (brown)
- Nose/Eyes: `#2C1810` (dark brown)
- Tongue: `#FF6B9D` (pink)

---

## Implementation Checklist

- [ ] Generate base spritesheets (3 per breed)
- [ ] Implement `DogSprite.jsx` with canvas rendering
- [ ] Add animation state machine in Redux
- [ ] Create `useAnimation` hook for frame cycling
- [ ] Add cleanliness overlay system
- [ ] Implement weather overlay layer
- [ ] Add life stage scaling logic
- [ ] Test all 16 animation states
- [ ] Optimize sprite loading (lazy load by breed)
- [ ] Add fallback for missing sprites

---

**Version:** 1.0  
**Last Updated:** 2024-01-15  
**Status:** In Progress (base sprites needed)
