# Development

This file is for contributors and maintainers.

## Tech Stack

- React + Vite
- Redux Toolkit
- Capacitor (Android/iOS)
- Optional Firebase cloud/auth integration

## Prerequisites

- Node.js 22+
- npm
- Android Studio (Android)
- Xcode on macOS (iOS)

## Local Setup

```powershell
npm install
Copy-Item .env.example .env.local
```

## Run Local Dev Server

```powershell
npm run dev
```

Web dev server is for iteration; validate mobile behavior in native projects.

## Android

```powershell
npm run build
npm run android:sync
npm run android:open
```

Run from Android Studio on emulator/device.

## iOS (macOS only)

```powershell
npm run build
npx cap sync ios
npx cap open ios
```

Run from Xcode on simulator/device.

## Environment Variables

Set in `.env.local`.

Required for Firebase cloud features:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Optional:

```env
VITE_FIREBASE_MEASUREMENT_ID=
VITE_OPENWEATHER_API_KEY=
VITE_WEATHER_DEFAULT_ZIP=10001
VITE_TRAILER_EMBED_URL=
VITE_TRAILER_URL=https://doggerz.app
VITE_PRE_REG_PRODUCT_ID=pre_reg_bonus_kit
VITE_PRE_REG_GIFT_COINS=500
```

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run preflight
```

CI-equivalent local verification:

```powershell
npm run ci:verify
```

## Relevant Directories

- `src/redux`, `src/logic`: game state + simulation rules.
- `src/features/game`, `src/components`: gameplay UI.
- `src/pages`: route screens.
- `src/firebase`, `src/lib/firebase*`: cloud boundaries.
- `android/`, `ios/`: native projects.
