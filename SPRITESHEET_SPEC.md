<!-- SPRITESHEET_SPEC.md -->

# Doggerz Spritesheet Specification (v1.1)

## Overview

Doggerz uses **2048x2048 PNG spritesheets** with a **16x16 grid** layout (128x128px per frame). Each life stage has a dedicated sheet.

### Current Implementation Delta (feat/animation-hook branch)

| Area                 | Spec (original)                       | Implemented                                          | Notes                                                                                     |
| -------------------- | ------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Rendering            | Canvas (`<canvas>`)                   | CSS background `<div>`                               | Simpler, leverages `background-position`; easy scaling & overlays.                        |
| Frame Cycling        | Manual tick loop                      | `setInterval` (fps per row)                          | Paused when `prefers-reduced-motion` is true.                                             |
| Cleanliness Tiers    | Fresh / Dusty / Dirty / Fleas / Mange | Fresh / Dirty / Fleas / Mange                        | Consolidated: "Dusty" merged into "Dirty". Thresholds defined in `src/constants/game.js`. |
| Thresholds           | Not finalized                         | FRESH ≥75, DIRTY ≥50, FLEAS ≥25, else MANGE          | See `CLEANLINESS_THRESHOLDS` constants.                                                   |
| Senior Speed         | 0.8× animations                       | Not yet applied globally                             | Hook can add per-stage fps multiplier later.                                              |
| Overrides            | Manual per action                     | Timed ephemeral overrides in reducers                | `animationOverride { name, expiresAt }` cleared passively.                                |
| Random Idles         | Not specified                         | 25% chance every 6–10s when idle                     | Picks from variant list (e.g. sit, scratch) to add life.                                  |
| Prefetch             | Not specified                         | Next life stage sheet preloaded at last 30% of stage | Implemented in `useDogAnimation`.                                                         |
| Cleanliness Visuals  | Dust / dirt / fleas / mange overlays  | Layered radial gradients + flea particles            | Mange adds contrast + saturation filter.                                                  |
| Performance Panel    | Not in spec                           | `SpritePerfPanel` (dev)                              | Listens to `doggerz:spriteFrame` events.                                                  |
| Legacy Sheet Support | Not mentioned                         | Auto-detect 256×320 (4×5, 64px frames)               | Fallback for early art assets.                                                            |

This section should be kept in sync when merging into `main` so artists & devs have authoritative reference.

---

## File Structure

```text

public/
└── sprites/
    ├── jack_russell_puppy.png      (2048x2048, 256 frames)
    ├── jack_russell_adult.png      (2048x2048, 256 frames)
    ├── jack_russell_senior.png     (2048x2048, 256 frames)
    └── [future breeds follow same pattern]

```

---

## Frame Layout (16x16 Grid)

| Row | Animation   | Frames | Start | End |
| --- | ----------- | ------ | ----- | --- |
| 0   | Idle        | 16     | 0     | 15  |
| 1   | Walk        | 16     | 16    | 31  |
| 2   | Run         | 16     | 32    | 47  |
| 3   | Sit         | 16     | 48    | 63  |
| 4   | Lay Down    | 16     | 64    | 79  |
| 5   | Eat         | 16     | 80    | 95  |
| 6   | Play (Ball) | 16     | 96    | 111 |
| 7   | Play (Tug)  | 16     | 112   | 127 |
| 8   | Sleep       | 16     | 128   | 143 |
| 9   | Bark        | 16     | 144   | 159 |
| 10  | Scratch     | 16     | 160   | 175 |
| 11  | Shake       | 16     | 176   | 191 |
| 12  | Potty       | 16     | 192   | 207 |
| 13  | Sad         | 16     | 208   | 223 |
| 14  | Excited     | 16     | 224   | 239 |
| 15  | Special     | 16     | 240   | 255 |

---

## Animation State Mapping

### Idle States

- **Neutral:** Idle animation (row 0)
- **Happy (>75):** Excited animation (row 14)
- **Sad (<25):** Sad animation (row 13)

### Action States

```js
const ANIMATION_MAP = {
  feeding: "eat", // Row 5
  playing: "play", // Row 6 or 7 (random)
  training: "sit", // Row 3
  resting: "sleep", // Row 8
  bathing: "shake", // Row 11
  walking: "walk", // Row 1
  barking: "bark", // Row 9
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

- **Primary sheet:** 2048 × 2048 px (16×16 frames)
- **Per frame:** 128 × 128 px
- **Default logical display:** 128 × 128 px element scaled (Puppy 0.8×, Adult 1.0×, Senior 0.9×)
- **Legacy fallback:** 256 × 320 px (4×5 frames at 64 × 64 px) auto-detected and mapped to reduced animation set.
- **Optional upscale for retina:** apply CSS `transform: scale(2)` or explicit width/height ×2 if art remains pixel-crisp.

### Animation Timing

- **Idle/Sleep:** 8 FPS (slow, subtle breathing)
- **Walk/Run:** 12 FPS
- **Actions (eat/play):** 10 FPS
- **Fast actions (shake/bark):** 15 FPS

### Sprite Component Integration

```jsx
// Current approach (CSS background) in EnhancedDogSprite.jsx
<div
  style={{
    width: frameSize * scale,
    height: frameSize * scale,
    backgroundImage: `url(${spriteSrc})`,
    backgroundSize: `${cols * frameSize}px ${rows * frameSize}px`,
    backgroundPosition, // computed from current frame index
    imageRendering: "pixelated",
  }}
  className="rounded-xl will-change-[background-position]"
/>
```

Advantages: fewer draw calls, simpler overlay stacking (cleanliness / weather), easy blending & filters.

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

### Fresh (≥75)

- **Base sprite** (no modifications)

### (Deprecated) Dusty

Merged into Dirty to reduce art complexity. If reinstated, map range 74–60 and apply subtle gray speckle layer.

### Dirty (50–74)

- **Overlay:** 25% opacity brown dirt patches
- **Animation:** Frequent scratching (every 15s)

### Fleas (25–49)

- **Overlay:** 40% dirt + animated flea sprites (tiny black dots)
- **Animation:** Constant scratching, unhappy expression

### Mange (0–24)

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

```text

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

- [x] Generate base spritesheets (3 life stages for Jack Russell) _(art WIP quality)_
- [x] Implement sprite component (CSS background rendering in `EnhancedDogSprite.jsx`)
- [x] Add animation override system in Redux (`animationOverride` in `dogSlice.js`)
- [x] Create `useDogAnimation` hook (frame cycling, random idle, prefetch, reduced motion)
- [x] Add cleanliness overlay + flea particle system
- [ ] Implement weather overlay layer (rain / snow particles + reaction timers)
- [x] Add life stage scaling logic (0.8× / 1.0× / 0.9×)
- [x] Test primary animation states (unit tests for derivation; visual QA remaining for all rows)
- [x] Optimize sprite loading (lazy single sheet + conditional prefetch next stage)
- [x] Add fallback for missing / legacy sheets (auto-detect 256×320 variant)
- [ ] Senior speed reduction (apply global fps multiplier 0.8×)
- [ ] Dirty tier passive scratch cadence (interval injection) — currently only overlay & stat penalties.
- [ ] Weather-driven cleanliness decay & mood interactions.

---

**Version:** 1.1  
**Last Updated:** 2025-11-23  
**Status:** Active – core animation system implemented; pending weather + senior speed tuning.

### Next Art / Code Priorities

- Finalize polished puppy/adult/senior sheets with consistent palette & silhouette.
- Produce flea & mange specific frames (optional) to replace overlay-only approach.
- Add rainfall & snowfall overlay sheets or procedural CSS animations.
- Integrate breed-specific row 15 animations (special) once additional breeds arrive.
- Senior animation speed multiplier (0.8×) implementation.
- Dirty passive scratch cadence (timer-triggered if not already scratching).

### Implementation Notes for Contributors

1. Add new animation rows by updating `getAnimationsForVariant` (or external map) and supplying a row/fps.
2. When adding new cleanliness tiers, update `CLEANLINESS_THRESHOLDS` and overlay logic in `EnhancedDogSprite`.
3. For performance debugging, hook into `window` event `doggerz:spriteFrame` emitted each frame.
4. To test prefetch, manually set `adoptedAt` far enough back so stage age ≥ 70% of max.
5. Prefer non-blocking preloads (`new Image().src = path`) for future breed sheets.
6. Keep sprite art within 16-color palette for retro coherence.
