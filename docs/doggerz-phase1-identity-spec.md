# Doggerz Phase 1 Spec

## Goal

Implement the first retention-focused content layer after the stable core loop:

- personal dog identity
- daily emotional flavor
- named first-time milestone cards

This phase should make the dog feel more uniquely "yours" without adding a new gameplay system.

## Product Outcome

After this phase, the player should quickly understand:

- this dog has preferences
- this dog has a daily emotional tone
- meaningful first-time moments are remembered and celebrated

The app should feel more authored and relational, not just simulated.

## Non-Goals

Do not add:

- new progression math
- multiplayer/social systems
- complex live ops
- a new save architecture
- a separate quest system

This phase should reuse the existing dog state, journal, memory, dream, training, and store surfaces.

## Existing Primitives To Reuse

Already in the codebase:

- dog identity and progression in `src/store/dogSlice.js`
- `memory.favoriteToyId`
- `journal.entries`
- `memories`
- `dreams`
- `milestones`
- `temperament`
- `emotionCue`
- `lifeStage`
- main dog presentation in `src/components/game/MainGame.jsx`
- memory timeline in `src/pages/MemoryReel.jsx`
- dream journal in `src/pages/Dreams.jsx`

This phase should extend those, not replace them.

## Scope

### 1. Preferences

Track a small set of inferred favorites:

- favorite toy
- favorite food
- favorite nap spot

These should be soft identity signals, not hard gameplay modifiers.

### 2. Daily Identity Flavor

Add one lightweight "today your dog is..." line derived from:

- temperament
- current mood / emotion cue
- recent care pattern
- life stage

This is presentation content, not a gameplay buff/debuff.

### 3. Named Milestone Cards

Add first-time named milestones for:

- first mastered trick
- first week together
- first favorite item discovered
- first big recovery

Each milestone should create:

- a journal entry
- a structured memory
- a small card-ready payload for UI presentation

## State Additions

Add these branches inside `state.dog` in `src/store/dogSlice.js`.

### `identityContent`

```js
identityContent: {
  dailyFlavor: {
    dayKey: null,
    title: null,
    body: null,
    tone: "calm",
    generatedAt: null,
  },
  preferences: {
    favoriteToyId: null,
    favoriteFoodType: null,
    favoriteNapSpotId: null,
    discoveredAtByKey: {},
  },
  milestoneCards: {
    lastShownId: null,
    queue: [],
    seenIds: [],
  },
}
```

Notes:

- keep `memory.favoriteToyId` for backward compatibility
- mirror favorite toy into `identityContent.preferences.favoriteToyId`
- `queue` should be small and serializable
- `seenIds` prevents repeating first-time celebrations

## Selectors

Add selectors in `src/store/dogSlice.js` and wire them into `src/hooks/useDogState.js`.

Required selectors:

- `selectDogIdentityContent`
- `selectDogPreferences`
- `selectDogDailyFlavor`
- `selectDogMilestoneCardQueue`
- `selectDogPrimaryFavoriteSummary`

Recommended derived selector shape:

```js
{
  favoriteToyId,
  favoriteToyLabel,
  favoriteFoodType,
  favoriteFoodLabel,
  favoriteNapSpotId,
  favoriteNapSpotLabel,
}
```

That keeps display logic out of components.

## Reducer / Helper Work

Implement as small helpers inside `src/store/dogSlice.js`.

### Preference inference helpers

- `ensureIdentityContentState(state)`
- `updateFavoriteToyPreference(state, now)`
- `updateFavoriteFoodPreference(state, foodType, now)`
- `updateFavoriteNapSpotPreference(state, napSpotId, now)`

Rules:

- infer from repeated actions, not single events
- do not flip favorites too aggressively
- only write a "favorite discovered" milestone once

Suggested thresholds:

- toy: after repeated active toy usage over multiple sessions
- food: after the same food type is used at least 3-5 times recently
- nap spot: after repeated sleep/rest in the same place

### Daily flavor helper

- `refreshDailyIdentityFlavor(state, now)`

Rules:

- generate once per local day
- draw from content tables, not inline strings
- use current temperament + mood + stage + recent behavior summary

### Milestone helpers

- `queueIdentityMilestoneCard(state, payload)`
- `markIdentityMilestoneSeen(state, id)`

Named milestone ids:

- `first_mastered_trick`
- `first_week_together`
- `first_favorite_item`
- `first_big_recovery`

## Trigger Points

Hook the new helpers into existing reducer flows.

### Training

When first trick mastery happens:

- queue `first_mastered_trick`
- push structured memory
- push journal entry

Likely hook near current obedience mastery handling in `src/store/dogSlice.js`.

### Session start / daily tick

At session start:

- refresh daily flavor if the day changed
- check first week together milestone

Likely hook near `registerSessionStart`.

### Feeding

On feed actions:

- update favorite food preference

Likely hook near the existing feed reducers.

### Play / active toy usage

On play actions:

- update favorite toy preference

Likely hook near `play`, `setActiveToy`, or toy profile usage.

### Sleep / rest

On rest / sleep transitions:

- update nap spot preference

Likely hook where doghouse sleep or yard sleep location is already resolved.

### Recovery

When the dog exits a rough state in a meaningful way:

- queue `first_big_recovery`

Keep this narrow:

- severe dirty to fresh
- runaway / danger recovery
- low-health recovery over a threshold

## Content Files

Add new authored content files instead of hardcoding strings in reducers.

Recommended files:

- `src/features/dog/identityFlavorContent.js`
- `src/features/dog/milestoneCardContent.js`

These should export plain objects / helper functions only.

## UI Entry Points

### Main Game

File: `src/components/game/MainGame.jsx`

Add:

- one compact daily flavor line near the top bar / hero area
- one compact favorites summary in the growth/identity region
- one lightweight milestone card surface when a queued milestone exists

Constraints:

- no full-screen modal
- no repeated toast spam
- one premium card at a time

### Top Bar

File: `src/components/layout/GameTopBar.jsx`

Optional, minimal:

- surface a short daily identity subtitle if space allows on mobile

If space is too tight, keep this in `MainGame.jsx` only.

### Memory Reel

File: `src/pages/MemoryReel.jsx`

Add support for:

- milestone-tagged entries
- favorite discovery entries
- first-week-together entry

This likely works automatically if journal/memory records are consistent.

### Dreams

File: `src/pages/Dreams.jsx`

No major UI work required in Phase 1.

Only add dream references later if daily identity flavor needs a callback line.

## Data Compatibility

This phase must preserve existing saves.

Rules:

- every new branch needs an `ensure*State` helper
- never remove `memory.favoriteToyId`
- default all new fields safely
- avoid migration scripts unless absolutely necessary

## Delivery Order

### Milestone A

- add state shape
- add selectors
- add content tables

### Milestone B

- favorite toy / food / nap spot inference
- journal + memory plumbing

### Milestone C

- daily flavor generation
- main game presentation

### Milestone D

- named milestone card queue
- first-time milestone triggers

## Suggested File Touches

Primary:

- `src/store/dogSlice.js`
- `src/hooks/useDogState.js`
- `src/components/game/MainGame.jsx`

New:

- `src/features/dog/identityFlavorContent.js`
- `src/features/dog/milestoneCardContent.js`

Secondary, only if needed:

- `src/components/layout/GameTopBar.jsx`
- `src/pages/MemoryReel.jsx`

## Acceptance Criteria

- player can see one daily flavor line that changes day to day
- player can identify at least one favorite preference in UI
- first-time milestone moments create memorable journal/memory entries
- save compatibility remains intact
- no new spammy overlays
- no change to core care/progression math

## What To Build Immediately After

If Phase 1 lands well, build Phase 2 next:

- morning greeting
- bedtime wind-down
- weekly memory snapshot

That is the correct follow-up because it compounds identity into habit.
