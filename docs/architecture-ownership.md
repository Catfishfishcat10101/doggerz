# Doggerz Module Boundaries and Ownership

## Ownership Model

- `Platform` owns build systems, CI, release pipelines, runtime env validation, and shared tooling.
- `Game Systems` owns dog simulation/state transitions and behavior logic.
- `Experience/UI` owns pages, layout, route composition, and platform-specific presentation.
- `Data/Cloud` owns Firebase integration, sync contracts, and persistence schema evolution.

## Directory Boundaries

- `src/redux`, `src/logic`, `src/constants`: game state + domain logic.
- `src/features/game`, `src/components`: presentation and interaction surfaces.
- `src/firebase`, `src/lib/firebase*`: cloud and remote persistence boundaries.
- `native/`: React Native/Expo shell and adapters.
- `scripts/`: quality gates and preflight health checks.

## Dependency Rules

- UI modules may depend on selectors/actions from `src/redux`; reducers must not import UI modules.
- `src/logic` must stay framework-agnostic and must not import React, router, or DOM APIs.
- Cloud code (`src/firebase`, `src/lib/firebase*`) must not directly import page components.
- Native runtime code (`native/`) should reuse domain/state modules from `src/` and keep platform APIs behind adapters.

## Change Ownership Expectations

- Changes touching `src/redux` + `src/logic` require `Game Systems` review.
- Changes touching CI/workflows/scripts require `Platform` review.
- Changes touching route topology (`src/AppRouter.jsx`) require `Experience/UI` review.
- Changes touching Firebase config/contracts require `Data/Cloud` review.
