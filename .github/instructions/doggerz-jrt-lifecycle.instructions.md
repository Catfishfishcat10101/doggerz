---
applyTo: "src/**/*.{js,jsx,css,json}"
description: "Use when working on Doggerz sprite systems, lifecycle rules, training/trick logic, or Jack Russell visual design. Enforce 64x64 sprite frame grids, the exact 180-day lifecycle with day-175 immunity, Capacitor-friendly JavaScript/CSS animation solutions, and consistent Jack Russell markings."
---

# Doggerz Jack Russell sprite + lifecycle rules

Follow these rules for all gameplay, animation, sprite, and lifecycle work in Doggerz.

## Core gameplay rules

- The dog lifecycle is **exactly 180 days**.
- The final-stretch immunity window begins at **day 175**.
- Do not introduce alternate lifespan thresholds, farewell ages, or rescue-immunity windows unless the user explicitly asks for a lifecycle redesign.
- When implementing age-based behavior, derive stage and state from the real age-in-days/timestamp logic already in the Redux lifecycle system. Do **not** hard-code fake adult/senior ages in runtime logic.

## Sprite and animation rules

- Always use a **64x64 pixel grid per sprite frame** when designing, specifying, documenting, or generating new sprite sheets, unless the user explicitly overrides that requirement.
- Keep sprite instructions, manifests, and playback assumptions aligned with that 64x64 grid.
- Prefer **JavaScript/CSS animation solutions only**.
- Keep animation code **Capacitor-friendly** and mobile-safe.
- Do **not** introduce microservices, backend animation services, or non-web runtime dependencies for animation playback.
- Prefer the repo's existing manifest-driven and JS-controlled sprite playback architecture over standalone DOM hacks or localStorage-only demo code.

## Jack Russell visual consistency

- The Jack Russell must always keep a **brown mask over the eyes**.
- The Jack Russell must always keep **one side spot**.
- Preserve those markings consistently across puppy, adult, and senior stages, plus all trick, idle, and special-action frames.
- If a generated or proposed sprite concept conflicts with those markings, correct the concept instead of carrying the inconsistency forward.

## Implementation guardrails

- Stay inside the existing React/Redux/Capacitor architecture.
- Prefer updating the canonical Doggerz systems (`dogSlice`, render model, manifest-driven sprite logic, route UI) instead of adding parallel demo systems.
- If test fixtures or sample code use unrealistic ages (for example, a hard-coded 400-day adult), treat that as fixture/sample cleanup work rather than as a new gameplay rule.
