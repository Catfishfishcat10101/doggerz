# Doggerz Agent Notes

## Project Context

- Product: `Doggerz`, a mobile virtual pet app centered on a Jack Russell Terrier.
- Core loop: `Adopt. Train. Bond.`
- Primary target: Android via Capacitor.
- Secondary target: web only as a fast dev/test shell.

## Actual Stack

- Frontend: `React`, `React Router`, and `Redux Toolkit`
- Styling: standard CSS plus existing shared utility/class patterns in the repo
- Mobile wrapper: `Capacitor`
- Backend/data: `Firebase Web SDK` (`Authentication` and `Firestore`)
- Architecture: strictly serverless

## Non-Negotiables

- Do not introduce Node backends, microservices, or heavy new platform layers.
- Do not pretend this repo is vanilla JS. It is a React/Redux app.
- Do not create duplicate state systems like a parallel `gameState` or `firebase-db.js`.
- Do not replace router-driven navigation with raw DOM tab switching.

## UI And Styling Rules

- Reuse existing CSS tokens first, especially:
  - `var(--app-bg)`
  - `var(--card-bg)`
  - `var(--card-highlight)`
  - `var(--text-main)`
  - `var(--text-muted)`
  - `var(--accent-gold)`
  - `var(--accent-green)`
  - `var(--bar-bg)`
  - `var(--health-color)`
  - `var(--energy-color)`
- Do not invent new hex colors if an existing token or established color direction already covers the need.
- Reuse existing shared classes/components where appropriate:
  - buttons: `btn-squish`, `dz-touch-button`
  - cards: `game-card`, `pup-card`
  - status chips and stat bars: existing HUD/game classes already in `src/index.css`
- Keep animations lightweight and mobile-safe:
  - prefer CSS transforms, opacity, and simple keyframes
  - prefer `steps()` for sprite work
  - avoid expensive JS animation loops when CSS can do the job

## Frontend Implementation Rules

- Prefer React state and component composition over direct DOM manipulation.
- If a UI behavior belongs to a route or component, implement it in that route/component.
- If a new effect needs global visibility, wire it through the existing router, modal, or layout system.
- Use `React Router` navigation, not manual view toggling with `display: none` across root screens.

## State Management Rules

- Dog/game state lives in Redux, primarily:
  - `src/redux/dogSlice.js`
  - `src/redux/dogThunks.js`
  - `src/components/dog/DogAIEngine.jsx`
- User/app preferences live in the existing Redux slices, not in ad hoc globals.
- If a feature changes dog stats, inventory, progression, or lifecycle:
  - update Redux through the correct reducer/thunk path
  - ensure derived UI updates from Redux selectors/components
  - keep cloud/local persistence inside the existing save pipeline
- Do not bolt on a second save path just to satisfy a small feature.

## Firebase Rules

- Keep all persistence serverless and Firebase-based.
- Prefer simple Firestore document updates through the existing thunk/path helpers.
- If cloud save logic changes, wire it through the established sync flow rather than writing standalone Firebase calls inside random UI files.
- Cloud-safe changes should degrade gracefully when Firebase is unavailable.

## Mobile-First Rules

- Optimize for Android WebView behavior first.
- Respect safe areas and bottom-nav spacing.
- Keep interactions touch-friendly and avoid hover-dependent UI.
- Avoid large, expensive runtime systems unless they materially improve gameplay.

## Practical Guidance

- Preserve the game fantasy: the dog should feel alive, mischievous, and readable.
- Favor bounded randomness over chaotic, hard-to-debug behavior.
- Keep features solo-dev maintainable.
- Prefer incremental improvements over rewrites unless a rewrite is explicitly requested.
