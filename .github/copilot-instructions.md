# Doggerz AI Coding Instructions

## Project Overview

**Doggerz** is a React-based virtual pet game (Tamagotchi-style) where users adopt and care for a Jack Russell Terrier through multiple life stages. The dog evolves from puppy → adult → senior with dynamic needs decay, temperament system, skill training, and mood tracking. Built as an offline-capable PWA with optional Firebase cloud sync.

**Core Loop:** feed → play → train → rest → level up
**Tech:** React 18 + Redux Toolkit + Vite + TailwindCSS + Firebase

## Architecture & Data Flow

### State Management (Redux Toolkit)

- **Single source of truth:** `src/redux/dogSlice.js` (~900 lines) contains ALL dog state logic
- **State shape:** `{ name, level, xp, coins, stats: {hunger, happiness, energy, cleanliness}, lifeStage, temperament, skills, mood, journal, streak, training, polls, ... }`
- **No server calls in reducers** – all mutations are pure; Firebase sync happens via thunks in `DogAIEngine.jsx`
- **Lifecycle integration:** `calculateDogAge()` from `utils/lifecycle.js` determines stage based on `adoptedAt` timestamp

### Critical Systems

#### 1. **Time-Based Decay System**

- `applyDecay()` calculates stat changes based on elapsed time since `lastUpdatedAt`
- Runs on: page load, every action, and 60s intervals (see `DogAIEngine.jsx`)
- **Life stage modifiers** (from `constants/game.js`): Puppies have 1.15x hunger decay, Seniors have 1.2x energy decay
- **Career perks** can modify decay rates (e.g., `hungerDecayMultiplier`)

#### 2. **Dual Persistence**

- **Immediate:** localStorage write on every state change (sync)
- **Debounced cloud:** Firebase write after 3s idle (`CLOUD_SAVE_DEBOUNCE`)
- **Auth-gated:** Cloud sync only happens when `auth.currentUser` exists
- **Hydration priority:** localStorage on mount → cloud pull on login

#### 3. **Cleanliness Tiers & Effects**

- Auto-calculated from `stats.cleanliness` value (FRESH → DIRTY → FLEAS → MANGE)
- Each tier applies penalties (happiness/energy decay) and modifiers (potty gain multiplier)
- Synced via `syncCleanlinessTier()` after every action

#### 4. **Training Systems**

- **Puppy:** Potty training (0/8 successes) → completion reduces accident rate by 35%
- **Adult:** Daily obedience drill required (tracked by ISO date) → missed days break streak & apply happiness penalty
- **Skills:** Obedience commands (sit, stay, rollOver, speak) level up via XP (50 XP per level)

#### 5. **Temperament Evolution**

- Three traits (clingy, toyObsessed, foodMotivated) with intensity 0-100
- `evaluateTemperament()` runs daily, adjusting intensities based on:
  - Recent mood samples (happy/hungry tags)
  - Journal entries (training/neglect counts)
  - Time since last interaction (feed/play/train)
- Primary/secondary labels (SPICY/SWEET/CHILL) derived from top 2 traits
- Reveal unlocks after 3 days (`revealReady` flag)

## Settings & Device Tuning

Doggerz exposes player-facing settings that live per-device and influence visuals, simulation behavior, and persistence. These are stored in `localStorage` under the key:

- `doggerz:settings` — JSON object describing location, appearance, gameplay tuning, and safety options.

Settings are **NOT** part of the Redux dog state; they are read-once on app load and consumed by the engine (DogAI, background hooks, theming).

### Settings Shape

```ts
type DoggerzSettings = {
  // Location / time source
  zip: string; // 5-digit US ZIP, default "65401"
  useRealTime: boolean; // true = use ZIP + OpenWeather; false = device-time only

  // Appearance
  theme: "dark" | "light";
  accent: "emerald" | "teal" | "violet"; // brand hue for highlights

  // Gameplay tuning
  bladderModel: "realistic" | "meals"; // time+meals vs meals-only bladder build
  difficulty: "chill" | "normal" | "hard";
  runMs: number; // sprint animation duration in ms (300–1600)
  autoPause: boolean; // pause DogAI when tab is not focused (visibilitychange)

  // Reserved for future:
  // soundEnabled: boolean;
  // vibrationEnabled: boolean;
};
```

## File Organization

### Path Aliases

Use `@/` for all imports (configured in `vite.config.js`):

````js
import { selectDog } from "@/redux/dogSlice.js";
import { LIFE_STAGES } from "@/constants/game.js";
- **State:** `src/redux/dogSlice.js` (all reducers), `src/redux/store.js` (RTK setup)
- **Sync:** `src/redux/dogThunks.js` (Firebase cloud save/load)
- **Engine:** `src/features/game/DogAIEngine.jsx` (tick loop, hydration, persistence orchestrator)
- **Constants:** `src/constants/game.js` (decay rates, thresholds, config)
- **Utils:** `src/utils/lifecycle.js` (age calculation), `src/utils/weather.js` (optional weather API)
- **Pages:** `src/pages/*.jsx` (route components: Home, Game, Adopt, Login, etc.)
- **Game features:** `src/features/game/` (MainGame, NeedsHUD, ObedienceDrill, MoodAndJournalPanel, etc.)
- **Shared:** `src/components/` (reusable UI like DogSprite, WeatherWidget)

Every care action (feed, play, rest, bathe, trainObedience) follows this structure:

  applyDecay(state, now);           // 1. Apply time-based decay
  // ... modify stats/state ...
  state.memory.lastSeenAt = now;    // 2. Update memory
  updateTemperamentReveal(state, now); // 6. Check reveal readiness
  finalizeDerivedState(state, now);    // 7. Sync lifecycle/cleanliness
}
**Never skip `finalizeDerivedState()`** – it ensures `lifeStage` and `cleanlinessTier` stay in sync.

### Firebase Defensive Coding & Graceful Degradation

```js
}
````

- Instructs user to "Update .env.local with your Firebase web config and restart the dev server"
- App remains fully functional in **local-only mode** (localStorage persistence)
- 1 real day = 4 game days (`GAME_DAYS_PER_REAL_DAY`)
- Puppy stage: 0-180 game days (0-6 months in-game)

### Journal & Mood Logging

- **Journal:** User-visible story log (`pushJournalEntry(state, { type, moodTag, summary, body })`)
- **Mood history:** Analytics data (`maybeSampleMood()` samples every 60 min)
- Both capped at 200/100 entries to prevent bloat

## User Experience Patterns

### Onboarding Flow

- **Splash** → **Adopt** screen (name input + breed selection)
- Default breed: "Jack Russell (default)"
- Adoption form displays commitment expectations:
  - "Your dog ages over real days, not sessions"
  - "Hunger, boredom, and dirt creep in while you're away"
  - "Neglect gets recorded in your pup's journal"
  - "Consistent care builds streaks and unlocks perks"
  - "You can always adopt again later, but each pup's story is unique"

### Error State Messaging

The app uses friendly, informative error screens:

- **Firebase disabled:** Shows warning icon + "Firebase Not Configured" heading
- Lists specific missing keys in red monospace text
- Provides clear remediation steps
- Maintains full offline functionality

### Navigation Structure

- Header: Logo (link to home) + About + Login + **Adopt** button (emerald green, prominent)
- Footer: Copyright + About + Settings + Legal links
- Main routes: `/` (splash), `/adopt`, `/game`, `/login`, `/signup`, `/about`, `/settings`, `/legal`, `/memory`, `/potty`

### Running Locally

```bash
npm install
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
```

### Environment Setup

Copy `.env.example` to `.env.local` and populate:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... (all 6 required Firebase keys)
VITE_OPENWEATHER_API_KEY=optional_weather_key
VITE_WEATHER_DEFAULT_ZIP=10001
```

**Missing Firebase keys?** App runs fine in local-only mode (localStorage persistence).

### Testing Lifecycle Changes

Toggle debug mode via Redux DevTools or add button:

```js
dispatch(toggleDebug());
```

Manually set `adoptedAt` timestamp to test different life stages:

```js
dispatch(setAdoptedAt(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000)); // 7 years ago
```

### Spritesheet Integration

- Expected format: 2048x2048 PNG, 128x128 frames (16x16 grid)
- Three life stage sheets: `jack_russell_puppy.png`, `_adult.png`, `_senior.png`
- Animation metadata lives in sprite components (not yet fully implemented)
- See `SPRITESHEET_SPEC.md` for full animation requirements

## Common Pitfalls

1. **Forgetting to apply decay:** Always call `applyDecay(state, now)` at start of reducer actions
2. **Mutating outside Redux:** State lives in Redux; never modify `localStorage` directly except in `DogAIEngine`
3. **Ignoring lifecycle sync:** After stat changes, call `finalizeDerivedState()` to update derived properties
4. **Time zone issues:** Use `Date.now()` (UTC milliseconds) everywhere, convert to ISO date strings (`YYYY-MM-DD`) for daily tracking
5. **Excessive cloud writes:** Cloud saves are debounced; don't manually trigger `saveDogToCloud()` unless necessary
6. **Breaking offline-first UX:** Always test features with Firebase disabled – the app must remain fully functional using only localStorage

## Design System

### Color Palette

- Background: `bg-zinc-950` (deep black), `bg-zinc-800` (borders)
- Text: `text-zinc-50` (primary), `text-zinc-400` (secondary), `text-zinc-500` (muted)
- Accent: `text-emerald-400` (brand), `bg-emerald-500` (CTA buttons)
- Alerts: `text-amber-400` (warning icons), red text for error details

### Typography

- Brand: "VIRTUAL PUP" (small caps, emerald) + "Doggerz" (bold, white)
- Headings: Large, bold, white text with good spacing
- Error states: Monospace for technical details (missing keys, file paths)

### Button Styles

- Primary CTA: `rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold`
- Secondary: `text-zinc-400 hover:text-white transition`
- Form inputs: Dark backgrounds with subtle borders

## Monetization Context

See `MONETIZATION_PLAN.md` for revenue strategy. Key points:

- Free tier: 1 dog, ads, basic breeds
- Premium ($4.99/mo): 5 dogs, rare breeds, ad-free
- In-app purchases: Coin packs, breed unlocks, XP boosts
- Rewarded ads: 100 coins or 30min boost per view

When adding features, consider premium gates (check `PREMIUM_FEATURES` in `constants/game.js`).

## Extension Guidelines

### Adding a New Stat

1. Add to `initialState.stats` in `dogSlice.js`
2. Define decay rate in `DECAY_PER_HOUR`
3. Create reducer actions (e.g., `increaseNewStat`)
4. Update UI in `NeedsHUD.jsx` or relevant component

### Adding a New Life Stage

1. Add stage config to `LIFE_STAGES` in `constants/game.js`
2. Add stage modifiers to `LIFECYCLE_STAGE_MODIFIERS`
3. Update `calculateDogAge()` logic in `utils/lifecycle.js`
4. Create new spritesheet and update `getSpriteSheet()`

### Adding a New Command/Skill

1. Add skill node to `initialSkills.obedience` in `dogSlice.js`
2. Implement training UI in `ObedienceDrill.jsx`
3. Call `trainObedience()` with `commandId` on success
4. Optionally add voice command integration (`VoiceCommandButton.jsx`)

## Questions to Resolve

When implementing features, clarify:

- **Sprite animation system:** How do we map Redux state → animation frame selection?
- **Voice commands:** Web Speech API integration details (browser support, permissions)
- **Weather effects:** Should weather condition affect decay rates or just visuals?
- **Multi-dog support (premium):** How to extend Redux state to array of dogs vs. single dog?
