<!-- @format -->
<!-- end -->

# Google Play release (Doggerz)

- **PWABuilder** (easiest): generates an Android project/APK/AAB from your PWA URL.
- **Bubblewrap** (more control): generates a TWA from your PWA URL.

This doc assumes you host Doggerz on **HTTPS** (required).

---

## 0) Pre-flight checklist (repo)

Run these locally before packaging:

- `npm run lint`
- `npm run build`
- `npm run preflight`

Optional (Play Store / verified TWA readiness):

- `npm run ci:playstore`

What we check:

- `public/manifest.webmanifest` exists + icons exist
- `public/sw.js` exists + CORE_ASSETS exist
- `public/.well-known/assetlinks.json` exists (recommended for verified TWA)

---

## 1) Hosting requirements

Your PWA **must** be hosted on:

- HTTPS
- a stable domain you control (example: `https://doggerz.app/`)

Make sure these URLs work:

- `https://YOUR_DOMAIN/manifest.webmanifest`
- `https://YOUR_DOMAIN/sw.js`
- `https://YOUR_DOMAIN/.well-known/assetlinks.json`
- `https://YOUR_DOMAIN/privacy` (your privacy policy page)

---

## 2) Digital Asset Links (required for verified TWA)

The repo includes `public/.well-known/assetlinks.json` as an empty array (`[]`) so local builds work cleanly.
Use `public/docs/assetlinks.template.json` as a starting point when you are ready to verify your TWA.

For a verified TWA, you must replace it with your real package name and SHA-256 certificate fingerprint.

Note: `npm run preflight -- --strict --require assetlinks` will FAIL if `assetlinks.json` is missing or still `[]`.

Shape:

- relation: `delegate_permission/common.handle_all_urls`
- target.namespace: `android_app`
- target.package_name: your Android application id
- target.sha256_cert_fingerprints: the **SHA-256** fingerprint of your signing cert

After hosting, verify it is reachable at:

`https://YOUR_DOMAIN/.well-known/assetlinks.json`

---

## 3) Packaging option A: PWABuilder

1. Open PWABuilder
2. Enter your production URL
3. Fix any reported PWA issues (manifest, icons, service worker)
4. Build Android package
5. Open the generated Android project in Android Studio
6. Create a signed **AAB** and upload to Google Play Console

PWABuilder is usually the fastest route.

---

## 4) Packaging option B: Bubblewrap

Prereqs:

- Node.js
- Java (JDK)
- Android Studio (for signing + bundle generation)

High-level steps:

1. Initialize Bubblewrap against your PWA URL
2. Generate Android project
3. Configure applicationId / versioning
4. Create keystore
5. Build signed **AAB**
6. Upload to Play Console

---

## 5) Play Console items you’ll need

- **App name**: Doggerz
- **Short description** / **Full description**
- **Screenshots** (phone required; tablet optional)
- **App icon** (512×512)
- **Feature graphic** (1024×500)
- **Privacy policy URL** (must be public)
- **Data Safety** form answers (Firebase/Auth/Firestore implies data collection depending on what you store)
- **Content rating** questionnaire

---

## 6) Recommended release practice

- Increment `package.json` version (we inject it into the app as `__APP_VERSION__`).
- Bump the service worker cache version if you changed cached assets (see `public/sw.js`).
- Confirm update flow:
  - Open app
  - Deploy new build
  - Refresh → update banner should appear → “Update” → reload controlled by new SW
