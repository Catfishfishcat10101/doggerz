<!-- README.md -->

# Doggerz

Doggerz is a virtual pet dog game built with React, Vite, Redux, Firebase, and Capacitor. The project is aimed at a native mobile app workflow, with the web build serving as the bundled frontend for Android.

## Overview

In Doggerz, the player raises a dog through daily care, training, and long-term progression.

Core gameplay includes:

- adopting and naming a pup
- feeding, watering, bathing, petting, and potty care
- training tricks and tracking obedience progress
- day/night and weather-driven scene changes
- memories, temperament reveals, and long-term life-stage progression
- a live yard scene with animated dog behavior and interaction

## Dog Features

Doggerz is built around a living-dog simulation loop rather than a static pet screen.

The dog system includes:

- core needs such as hunger, thirst, energy, happiness, cleanliness, and potty pressure
- a bond system that grows through regular care, attention, and successful routines
- life stages that move from puppy to adult to senior
- temperament and personality systems that influence reactions and long-term behavior
- autonomous yard behavior, including walking, barking, digging, resting, sleeping, and environmental investigation
- dream and memory systems that record meaningful moments and feed back into behavior
- weather-aware and time-of-day-aware scene presentation
- training progression for potty habits, obedience, and trick mastery
- surprise and treasure-style interactions layered into the main yard loop

## Dog Actions And Behaviors

The dog can perform both player-driven and autonomous actions.

Player-driven care actions include:

- petting
- feeding
- giving water
- bathing
- potty guidance
- resting
- playing with toys
- trick training

Petting is not a single canned response. Depending on mood, energy, happiness, and temperament, a pet can turn into:

- a calm cuddle
- a dozy, sleepy response
- a burst of zoomies-style excitement
- a terrier-style side-eye reaction

Autonomous behaviors include:

- wandering around the yard
- stopping to idle or settle
- barking for attention or from loneliness
- scratching when the dog feels unclean
- begging when hunger is high
- sleeping when energy is low
- digging or investigating interesting spots in the environment
- reacting to props, ambient events, and special interactions

The render and animation systems also support behavior-specific states such as:

- walk
- bark
- scratch
- sit
- wag
- eat
- drink
- sniff
- rest and lay-down states
- light sleep and deep dream sleep

## Memory, Temperament, And Progression

Doggerz tracks more than surface stats.

The dog builds a history through:

- care memories
- training results
- treasure finds
- surprise events
- dream entries
- recent positive and negative interactions

Those systems feed into longer-term personality and behavior shaping, including:

- affection
- social behavior
- playfulness
- energy level
- stubborn or spicy reactions
- calm or sweet tendencies

This gives the dog a more persistent identity over time instead of resetting to the same reaction loop every session.

## Training And Growth

Progression is designed as a slow relationship loop.

That includes:

- potty training gates before deeper trick work unlocks
- obedience commands and mastery tracking
- bond growth through repeated positive interaction
- stage progression from puppy to adult to senior
- celebration moments when skills or milestones are reached

## Yard Interaction Loop

The main yard is where most of the game happens.

In the yard, the dog can:

- move around freely
- react to taps and pets
- interact with bowls, toys, props, and points of interest
- respond to ambient scene events
- change animation and posture based on sleep, mood, or behavior
- visually feel grounded in the environment through depth scaling, shadowing, and scene layering

## Tech Stack

- React 18
- Vite 7
- Redux Toolkit
- TanStack Query
- Pixi.js
- Firebase
- Capacitor Android

## Project Structure

Main source folders:

- `src/app` app bootstrap, routing, providers, app shell
- `src/components` game UI, dog systems, renderers, shared components
- `src/features` gameplay systems such as training, audio, weather, and dog progression
- `src/store` Redux store, slices, selectors, and thunks
- `src/lib` shared runtime helpers and integrations
- `android` Capacitor Android project

## Requirements

- Node `24.13.0`
- npm
- Android Studio for native Android builds

The repo includes a pinned Node version in [.node-version](./.node-version).

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Fill in the Firebase values in `.env.local` if you want auth or cloud-sync features enabled.

4. Start the dev server:

```bash
npm run dev
```

5. Open the local app in the browser for frontend iteration:

```text
http://localhost:5173
```

## Environment Variables

See [.env.example](./.env.example) for the full list.

Important values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_OPENWEATHER_API_KEY`
- `VITE_WEATHER_DEFAULT_ZIP`

Notes:

- Firebase is required for auth and cloud sync features.
- Weather falls back to local behavior if weather env values are missing.
- This repo does not require Vercel for normal development or Capacitor builds.

## Common Scripts

Development:

```bash
npm run dev
npm run dev:host
```

Quality checks:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

Android workflow:

```bash
npm run android:sync
npm run android:open
npm run android:run
npm run release:android:build
```

Preflight and verification:

```bash
npm run preflight
npm run ci:verify
```

## Android Build Flow

Doggerz is set up as a Capacitor app with:

- app id: `com.doggerz.app`
- bundled web directory: `dist`

Typical Android workflow:

1. Build the frontend:

```bash
npm run build
```

2. Sync Capacitor:

```bash
npm run android:sync
```

3. Open Android Studio:

```bash
npm run android:open
```

4. Build or run from Android Studio.

## Play Store release flow

Doggerz now includes a guarded Android release builder that validates:

- required icons and manifest files
- Android signing configuration
- AAB output location
- optional Google Play upload parameters

Recommended commands:

```bash
npm run release:android:build
npm run release:android:bump
npm run release:android:internal
```

Supporting docs:

- [PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md)
- [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md)

## Deployment Notes

- The primary target is the native app, not a hosted web app.
- `dist/` can be used for static hosting if needed.
- Firebase Hosting config is included in [firebase.json](./firebase.json), but web hosting is optional.

## Status

Doggerz is an active in-progress project. The codebase contains live gameplay systems, native mobile wiring, and ongoing scene/animation work.

## Links

- Website: https://doggerz.app
- Support: support@doggerz.app
- Instagram: https://instagram.com/doggerz
- X/Twitter: https://twitter.com/doggerz
- Facebook: https://facebook.com/doggerz
