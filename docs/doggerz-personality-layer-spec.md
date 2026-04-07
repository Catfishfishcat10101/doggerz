Original prompt: define the first personality layer spec

# Doggerz Personality Layer Spec

## Goal

Ship the first product-facing personality layer for Doggerz without replacing the existing temperament, personality, mood, or renderer systems.

This layer should make the dog feel more distinct in everyday play through:

- subtle ambient behavior differences
- slightly different command responsiveness
- more specific daily flavor and memory copy
- clearer "this dog has habits" signals

It should not:

- create a second dog brain
- destabilize the `/game` loop
- introduce chaotic or annoying behavior
- break current save shape or cloud compatibility

## Current State

The repo already has strong primitives:

- `temperament` in [src/store/dogSlice.js](C:/Users/fireb/doggerz/src/store/dogSlice.js)
  - primary / secondary temperament tags
  - archetype reveal
  - tracking metrics like taps, neglect minutes, play sessions
- `personality` drift in [src/store/dogSlice.js](C:/Users/fireb/doggerz/src/store/dogSlice.js)
  - signed trait drift for `adventurous`, `social`, `energetic`, `playful`, `affectionate`
- derived `personalityProfile` in [src/features/dog/personalityProfile.js](C:/Users/fireb/doggerz/src/features/dog/personalityProfile.js)
  - confidence
  - frustration
  - learned traits
  - trust signals
- mood and emotion routing in [src/store/dogSlice.js](C:/Users/fireb/doggerz/src/store/dogSlice.js)
- render selectors already consuming personality profile in [src/components/dog/redux/dogSelectors.js](C:/Users/fireb/doggerz/src/components/dog/redux/dogSelectors.js)
- identity/favorites content now present via `identityContent`

Conclusion:
The missing piece is not data collection. The missing piece is a small expression layer that turns existing state into visible dog-specific behavior.

## Product Direction

The first layer should express three personality styles that players can feel quickly:

1. `clingy`

- wants proximity and reassurance
- responds well to petting and rest
- more likely to idle near the player / settle close

2. `playful`

- initiates gentle movement and toy interest
- responds strongly to play and training wins
- more likely to enter short attentive/walk bursts

3. `stubborn`

- calmer but less immediately compliant
- more likely to hesitate on commands
- needs trust/routine before feeling reliable

These are not exclusive permanent classes. They are the first visible "expression poles" derived from existing temperament + personality profile.

## Why This Is The Right First Layer

This comes before a bigger personality system because it:

- uses state already in the store
- can be surfaced in the yard without new screens
- improves dog uniqueness immediately
- is measurable with the analytics already added
- is low-risk compared with adding story arcs or complex AI

## Architecture

Do not replace existing store structures.

Add one derived module:

- `src/features/dog/personalityExpression.js`

This module should:

- read `dog.temperament`
- read `dog.personality`
- read `dog.personalityProfile`
- read favorites and recent memory cues
- output a small normalized expression model

Recommended output shape:

```js
{
  style: "clingy" | "playful" | "stubborn",
  confidenceBand: "low" | "mid" | "high",
  socialNeedBand: "low" | "mid" | "high",
  initiativeBand: "low" | "mid" | "high",
  commandReliabilityBand: "low" | "mid" | "high",
  preferredPromptTone: "reassuring" | "bright" | "steady",
}
```

This should be derived only. Do not persist it directly.

## Inputs

Use only existing sources for v1:

- `temperament.primary`
- `temperament.secondary`
- `temperament.archetype`
- `temperament.traits`
- `personality.traits`
- `personalityProfile.dynamicStates`
- `personalityProfile.learnedTraits`
- `bond.value`
- `emotionCue`
- favorite toy / food / nap spot

## Expression Rules

Keep them simple and deterministic.

### Clingy

Bias toward `clingy` when:

- social / affectionate traits are positive
- trust is high
- confidence is mid or low
- temperament includes `SWEET` or `SHADOW`
- frustration is not dominant

Visible effects:

- stronger rest/cuddle copy
- more likely to settle into calm idle after interaction
- more likely to ask for reassurance via polls/daily flavor

### Playful

Bias toward `playful` when:

- energetic / playful traits are positive
- confidence is high enough
- frustration is low to mid
- temperament includes `PLAYFUL`, `ATHLETE`, or toy-obsessed traits

Visible effects:

- slightly more ambient attentive/walk moments
- stronger positive reaction to toys and training wins
- brighter daily flavor and memory wording

### Stubborn

Bias toward `stubborn` when:

- frustration is elevated
- command reliability is not yet strong
- trust is mid or low
- temperament includes `SPICY`, `INDEPENDENT`, or similar signals

Visible effects:

- more "thinking about it" or hesitation copy
- slightly lower training confidence feedback
- steadier, less eager presentation until trust improves

## First Visible Surfaces

Do not add a new screen first.

Apply the first layer in these places only:

1. `MainGame.jsx`

- add one compact personality read line near the existing identity block
- examples:
  - "Stays close when the yard feels quiet."
  - "Perks up fast when play starts."
  - "Warms up on their own schedule."

2. Daily flavor generation

- extend the identity flavor system to vary body copy by personality style

3. Ambient behavior weighting

- gently bias the existing wander/attentive loop
  - clingy: lower movement frequency, more calm settle moments
  - playful: slightly more attentive/walk bursts
  - stubborn: no extra movement, slightly longer idle pauses

4. Training feedback copy

- do not change training math first
- only change helper/reaction wording so personality becomes legible

5. Poll prompts

- use expression style to choose which ask feels most natural

## What Not To Change In V1

Do not change:

- core need decay
- save schema in a breaking way
- animation asset policy
- DogMovementSystem architecture
- command success math in a major way
- renderer state machine structure

V1 should be mostly copy + weighting + derived presentation.

## Implementation Milestones

### Milestone 1: Derived Expression Model

Files:

- new `src/features/dog/personalityExpression.js`
- `src/components/dog/redux/dogSelectors.js`
- `src/hooks/useDogState.js`

Work:

- create `derivePersonalityExpression(dog)`
- expose selector and hook
- no UI changes yet

Success:

- every dog resolves to one stable style
- style does not thrash every render

### Milestone 2: Main Game Readability

Files:

- `src/components/game/MainGame.jsx`

Work:

- surface style label and one supporting line in the identity/progression stack
- keep copy subtle and premium

Success:

- player can feel a difference without opening a debug page

### Milestone 3: Daily Flavor Integration

Files:

- `src/features/dog/identityFlavorContent.js`
- `src/store/dogSlice.js`

Work:

- feed personality style into daily flavor generation
- vary tone/body without overproducing text

Success:

- daily copy reads like this dog, not a generic dog

### Milestone 4: Ambient Weighting

Files:

- `src/components/game/MainGame.jsx`
- only if necessary: a very small helper near current ambient logic

Work:

- gently bias existing ambient loop timing and action choice
- do not invent a parallel simulation model

Success:

- player notices style over time
- no jitter or chaos regressions

### Milestone 5: Training / Prompt Copy

Files:

- `src/components/game/MainGame.jsx`
- relevant training copy helpers only

Work:

- change wording of command helper text / reaction messaging
- no major training logic changes

Success:

- stubborn vs playful vs clingy dogs read differently in training

## Suggested Copy Patterns

### Clingy

- "Feels safest when routines stay close."
- "Settles faster after a little reassurance."
- "Seems happiest when you check in often."

### Playful

- "Lights up fast when the yard gets interesting."
- "Treats small moments like invitations to play."
- "Carries a little extra bounce through the day."

### Stubborn

- "Prefers to warm up in their own time."
- "Listens better once trust feels earned."
- "Not difficult. Just selective."

## Measurement Plan

Use the analytics already added.

Primary checks:

- session duration
- enter_game return frequency
- feed / water / play usage balance
- level-up cadence after personality layer ships

What to watch:

- do players spend longer in yard sessions
- do play actions increase for playful dogs
- do clingy dogs correlate with better return behavior

## Risks

### Risk 1: The style feels fake

Mitigation:

- drive from existing state only
- do not overstate differences in copy

### Risk 2: Behavior gets annoying

Mitigation:

- keep ambient changes subtle
- no bark spam
- no hard command sabotage

### Risk 3: Too much overlap with temperament system

Mitigation:

- temperament remains the underlying source
- expression is just the visible surface

### Risk 4: Style thrashes

Mitigation:

- derive from stable bands, not raw fluctuating values
- only recompute label changes when thresholds are crossed

## Recommendation

Build this next.

This is the right post-core move because it:

- increases attachment
- uses the systems already in the app
- improves retention more than another large feature would
- stays realistic for a solo React/full-stack developer

## Immediate Next Step

Implement Milestone 1 only:

- add the derived expression module
- add selector/hook plumbing
- no UI or behavior changes until the derived model is stable
