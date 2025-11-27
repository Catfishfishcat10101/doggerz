# Manual QA Checklist — Sprite Rendering & Game Visuals

Purpose

- A concise manual test plan to validate sprite rendering, cleanliness overlays, LQIP behavior, animation timing, and cloud-sync defensive UI for the Doggerz game.

Where to run

- Local dev server (Vite): `npm run dev` (default `http://localhost:5173`)
- Visual screenshot helpers:
  - `npm run visual:screenshots:start` (Playwright runner + start server)
  - `npm run screenshots:start` (older script; covers several pages)

Prerequisites

- Node + npm installed
- `npm install` run once
- If running Playwright-based screenshots on a fresh machine, install browsers:

```bash
npx playwright install --with-deps
```

Quick commands

- Start dev server:

```bash
npm run dev
```

- Run visual screenshot matrix (auto-start server):

```bash
npm run visual:screenshots:start
```

General verification notes

- Use an incognito/dev browser or clear `localStorage` to avoid stale state.
- Open browser devtools console and watch for DEV logs we added:
  - `useDogAnimation: finalSpriteSrc` — shows chosen sprite URL and type
  - `useDogAnimation: preload attempt ...` — retry traces
  - `useDogAnimation: idle config { stageKey, cfg }` — per-stage frame config
- Look for the dev overlay (top-right of the sprite) showing `frameIndex`, `bg-size`, and `bg-pos`. It appears only in dev builds (`import.meta.env.DEV`).

Core scenarios (step-by-step)

1. Adopt / Landing UX

- Steps:
  - Start at `/` (Landing). Use the Adopt flow (name input). Press Enter.
  - Expect: input triggers the bounce/jump sound and navigates to `/game`.
  - Verify: dog is present, initial sprite loads (no indefinite "Sprite unavailable").
- Acceptance:
  - Navigation happens on Enter, bark/jump animation plays, and sprite appears.

2. Sprite Loading & LQIP

- Steps:
  - With a fresh browser load, open `/game`.
  - Observe the LQIP blurred placeholder appears immediately.
  - Confirm: full sprite fades in within ~200–600ms after asset loads.
- Acceptance:
  - No large empty boxes while assets load; placeholder visible and fades out.

3. Life stage + Cleanliness matrix (visual correctness)

- Steps:
  - Use the Playwright script (`npm run visual:screenshots:start`) or manually set `localStorage` `doggerz:dogState` to combinations of `lifeStage`=`puppy|adult|senior` and `cleanlinessTier`=`FRESH|DIRTY|FLEAS|MANGE`.
  - Open `/game` for each combination.
- Verify per-case:
  - Sprite graphic corresponds to life stage (puppy/adult/senior).
  - Cleanliness overlays (gradients) appear for non-FRESH states.
  - Flea particles appear for `FLEAS` and `MANGE` and scale with sprite size.
  - Overlays/particles are positioned consistently and don't clip.
- Acceptance:
  - No misaligned overlays; fleas are inside the sprite bounds and sized proportionally.

4. Vector → Raster fallback

- Steps:
  - Simulate SVG failure (e.g., temporarily rename the bundled SVG file or block network request) so the hook attempts PNG fallback.
  - Reload `/game`.
- Verify:
  - `useDogAnimation` DEV logs show retry attempts and PNG fallback usage.
  - Sprite still appears (raster), with `imageRendering: pixelated` applied for PNG.
- Acceptance:
  - No permanent "Sprite unavailable"; PNG fallback works.

5. Animation timing & idle frames

- Steps:
  - Observe the dog sprite in each life stage for several seconds.
  - Watch `frameIndex` in the dev overlay and console `useDogAnimation: idle config` logs.
- Verify:
  - Idle animation uses configured `frames` and `interval` per `IDLE_ANIM` (puppy/adult/senior differences).
  - No stutter or sub-pixel jitter in frame alignment when `bg-pos` changes.
- Acceptance:
  - Smooth, consistent stepping; values shown in dev overlay match expected config.

6. Pixel alignment (no subpixel artifacts)

- Steps:
  - Zoom in on sprite in browser devtools, or capture a high-resolution screenshot.
  - Check edges of frames for hairline gaps or blurring between frames.
- Acceptance:
  - background-position and background-size use integer px values; no hairline seams.

7. Cloud sync defensive UI

- Steps:
  - Simulate permission-denied during cloud sync (e.g., revoke Firestore read permissions or emulate error in `loadDogFromCloud`).
  - Reload the app.
- Verify:
  - Console contains message about cloud sync disabled due to permission errors.
  - `localStorage` key `doggerz:cloudDisabled` is set to `1`.
  - App continues to operate offline (localStorage hydrate only).
- Acceptance:
  - Cloud errors do not crash the app; defensive UI (if present) shows cloud-disabled notice.

8. Dev debug overlay / logging

- Steps:
  - In dev mode, verify top-right overlay shows `src`, `frame`, `size`, `bg-size`, `bg-pos`, and `render` mode.
  - Copy the sprite filename for a failing case and inspect the network tab for that resource.
- Acceptance:
  - Overlay updates live and matches console logs.

Test artifacts & screenshot baseline

- Store screenshots under `screens/visual/` (Playwright script writes here).
- For CI: capture baseline images and store in a known path for pixel-compare jobs.

Failure triage checklist

- If sprite doesn't load:
  - Check console for `useDogAnimation` preload logs and errors.
  - Inspect network tab for 404s or blocked requests.
  - Confirm imports in `src/utils/getSpriteForLifeStage.js` match actual filenames in `src/assets/sprites/jackrussell/`.
- If overlays misalign:
  - Check `frameSize`, `frameX`, `frameY` values in the debug overlay.
  - Temporarily enable large `scale` values to visualize particle positions.

Selectors & quick dev helpers

- Sprite container: `div[role="img"]` (used by the Playwright script)
- Dev overlay: top-right small monospace panel (visible only in DEV)

Acceptance criteria (for merging sprite sprint)

- All life stage sprites render without persistent "Sprite unavailable" in dev.
- Cleanliness overlays/particles scale and align across stages and viewports.
- PNG fallback works when SVG fails.
- Playwright script produces a full matrix of screenshots in `screens/visual/`.

If you'd like, I can:

- Add a `README.md` under `screens/visual` describing how to approve/compare screenshots.
- Add a simple GitHub Actions workflow to run the Playwright runner and upload artifacts.

---

Generated by automation as part of the sprite-rendering sprint.
