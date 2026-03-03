# 🐶 Doggerz

**Adopt. Train. Bond.** A realistic pet simulation focused on unpredictable AI behaviors and deep companionship.

[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc)](https://redux-toolkit.js.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF)](https://capacitorjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Optional-ffca28)](https://firebase.google.com/)

---

## Current Direction

Doggerz is built as a **Vite web app wrapped by Capacitor** for Android (and iOS later).
The Expo runtime has been removed.

## Run Web (Vite)

```powershell
npm install
npm run dev
```

## Android (Capacitor) Build

```powershell
npm install
npm run build
npm run android:sync
npm run android:open
```

Then use Android Studio to run on a device/emulator.

### WebView Performance Notes

- Hardware acceleration is enabled in `android/app/src/main/AndroidManifest.xml`.
- `MainActivity` sets WebView renderer priority and hardware layer type.

## Automated Tests

```powershell
npm test
```

Watch mode:

```powershell
npm run test:watch
```

---

## Notes

- Core gameplay logic lives under `src/redux` and `src/logic`.
- UI is the Vite web app (`src/pages`, `src/components`).
