# 🐶 Doggerz

**Adopt. Train. Bond.** A realistic pet simulation focused on unpredictable AI behaviors and deep companionship.

[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc)](https://redux-toolkit.js.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-000020)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.76-61dafb)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Optional-ffca28)](https://firebase.google.com/)

---

## Current Direction

Doggerz is now migrating to a **React Native + Expo** architecture.

- `npm run dev` starts Expo (native-first workflow).
- `npm run native:android` / `npm run native:ios` run device builds.
- `npm run dev:web` still runs the legacy Vite web app during migration.

Phase 1 is live in this repository:

- Native Expo entrypoint and app config are in place.
- Core gameplay state uses the existing `dogSlice` reducer/actions.
- Native persistence is wired through AsyncStorage.
- The legacy web/Capacitor code remains intact so migration can continue incrementally.

---

## Run Native (Expo)ettings screens

```powershell
npm install
npm run dev
```

Then press:

- `a` for Android emulator/device
- `i` for iOS simulator/device
- `w` for Expo web preview

---

## Legacy Web Build (Transitional)

```powershell
npm run dev:web
npm run build
```

## Automated Tests

```powershell
npm test
```

Watch mode:

```powershell
npm run test:watch
```

---

## Migration Notes

- Most gameplay logic under `src/redux`, `src/logic`, and `src/constants` is intended to be reused in native.
- Existing PixiJS/Tailwind/router UI remains in the web app until screens are fully ported.
- Ownership and module boundaries are documented in `docs/architecture-ownership.md`.
