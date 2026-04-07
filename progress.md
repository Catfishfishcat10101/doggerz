Original prompt: continue with milestone c

- Phase 1 identity content
  - Milestone A completed: `identityContent` state branch, selectors, content tables, hydration defaults.
  - Milestone B completed: favorite toy/food/nap inference with memory/journal discovery writes.
  - Milestone C completed: reducer-generated daily identity flavor plus compact `/game` presentation.

- Milestone C notes
  - Daily flavor now generates once per calendar day using stage, temperament, current mood cue, and favorite summary.
  - Refresh points are reducer-side only: hydrate, new adoption, and session start.
  - Main game shows one compact "Today With <dog>" card and current favorites chips in the stats stack.

- TODOs
  - Milestone D: milestone card queue and first-time milestone triggers.
  - If daily flavor needs stronger variation later, add more stage templates before adding more logic.
  - Run lint/build/UI validation later; skipped intentionally per user instruction.
  - Firebase Analytics pass added separately: `app_open`, `enter_game`, `feed_dog`, `give_water`, `play_with_dog`, `level_up`, `session_duration` via a lightweight guarded wrapper.
  - Firebase Remote Config added separately: browser-safe init on app boot plus typed getters in `src/lib/firebase/remoteConfig.js`.
  - First personality-layer spec added in `docs/doggerz-personality-layer-spec.md`; recommended next implementation is Milestone 1 only (derived expression model + selector plumbing).

- Phase 2A DogBrain foundation
  - Added `src/features/dog/brain/DogBrain.js` as a pure decision layer. It returns `desiredAction`, optional `desiredTarget`, `reason`, and `priority` from existing dog state only.
  - Added `src/features/dog/brain/brainSelectors.js` to expose the reduced brain input model and a selector-style decision entry point.
  - Current decision policy is intentionally calm: `sleep` -> `rest` -> `walk` on low stimulation -> `sniff` near existing props -> `idle`.
  - No movement or renderer wiring yet. This pass is foundation only and does not change the live `/game` behavior by itself.

- Phase 2B DogBrain movement integration
  - Added `src/features/dog/brain/applyBrainDecision.js` to translate DogBrain decisions into existing simulation fields (`aiState`, `action`, `targetPosition`, `mood`) with emergency overrides and hold-safe behavior.
  - Updated `src/components/dog/simulation/DogSimulationEngine.js` to replace ambient `determineDogState()` usage with `evaluateDogBrain(...)` + `applyBrainDecision(...)` and to emit wander memory entries only when a new walk target starts.
  - Kept movement ownership on `updateDogMovement` and world coordinates; no new movement model added.
  - Added a single guard in `MainGame` (`SIMULATION_OWNS_AMBIENT_WANDER`) to prevent the legacy local auto-wander loop from competing with simulation-driven movement.

- Phase 2C safe animation policy
  - Added `src/features/game/rendering/animationPolicy.js` as the single state-to-render policy layer.
  - `DogStage` now resolves renderer intent through the policy instead of ad hoc local action picking.
  - `DogRenderer` now sanitizes all incoming animation requests defensively before resolving sprite keys, so unsupported states degrade to calm idle and bark remains one-shot only.
  - `animationMap.js` stays the temporary art routing layer underneath the policy and still degrades unsupported visuals to `idle_resting`.

- Phase 2D lightweight mood readability
  - Added `src/features/dog/mood/getMoodPresentation.js` to turn current dog state into a compact presentational mood model.
  - Added `src/components/game/MoodBadge.jsx` for a single subtle yard-side mood readout.
  - `MainGame` now uses the shared helper and places the badge inside the game scene as lightweight emotional context rather than another stat block.

- Phase 2E first memory moments
  - Added `src/features/dog/memory/memoryEvents.js` for normalized memory-moment events, type metadata, cooldown defaults, and doghouse sleep dedupe keys.
  - Added `src/features/dog/memory/memoryFormatter.js` to format moment events into concise, emotional UI copy.
  - Added `src/components/game/MemoryMomentToast.jsx` for a lightweight premium-style moment card.
  - `MainGame` now enqueues and displays first-pass moments from existing gameplay signals: first level-up, trick mastered, treasure found, slept in doghouse, and midnight zoomies, with queueing + dedupe + cooldown to avoid spam.
  - Disabled the legacy mastered-toast duplicate in `MainGame`; mastery now surfaces through celebration + memory moment instead of stacked notifications.

- Phase 3H retention cadence foundation
  - Added `src/features/dog/cadence/retentionCadence.js` with deterministic daily micro-moments, rotating care focus, weekly routine themes, and gentle surprise-find hints keyed by dog/profile + date.
  - Wired cadence output into `MainGame` as a single compact "Care Cadence" card to keep return reasons visible but low-noise.
  - Kept implementation presentation-first and reusable (no heavy event engine changes).

- Phase 4B analytics tracking
  - Centralized required analytics events in `src/lib/analytics/gameAnalytics.js`.
  - Added helper functions for `app_open` and `session_duration` and kept existing helpers for `enter_game`, `feed_dog`, `give_water`, `play_with_dog`, `train_trick`, and `level_up`.
  - Updated `src/app/main.jsx` to use `trackAppOpen(...)` and `src/pages/Game.jsx` to use `trackSessionDuration(...)`, removing direct event calls outside the helper layer.

- Phase 4C A/B testing foundation
  - Added `src/features/experiments/gameExperimentConfig.js` as a small Remote Config wrapper with strict defaults, normalization, clamping, and cached reads.
  - Added experiment keys/defaults in `src/lib/firebase/remoteConfig.js`:
    - `ab_game_dog_scale_bias`
    - `ab_game_idle_animation_intensity`
    - `ab_game_ui_layout_variant`
  - Wired `/game` to read experiment config safely in `MainGame` and apply:
    - dog scale bias passthrough
    - idle animation intensity passthrough
    - UI layout variant tweaks (`default`, `compact_hud`, `expanded_yard`)
  - Updated `DogStage` + `DogRenderer` to consume experiment props safely; idle intensity only changes idle-loop speed.
  - Failure path remains safe: defaults are always used if Remote Config is unavailable or invalid.
