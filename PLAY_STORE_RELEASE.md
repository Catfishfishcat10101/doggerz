# Doggerz Android release flow

Doggerz ships as a Capacitor Android app. The safest release path is now the scripted flow below.

## Prerequisites

### Release signing

Provide signing values with environment variables, or via `android/keystore.properties` for local-only use.

Preferred environment variables:

- `DOGGERZ_ANDROID_KEYSTORE_PATH`
- `DOGGERZ_ANDROID_KEYSTORE_PASSWORD`
- `DOGGERZ_ANDROID_KEY_ALIAS`
- `DOGGERZ_ANDROID_KEY_PASSWORD`

### Play upload credentials

Needed only for upload steps:

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

You can also use `GOOGLE_APPLICATION_CREDENTIALS` or pass `--credentials <path>`.

## Build an AAB

Use the guarded release builder:

- `npm run release:android:build`
- `npm run release:android:bump`

What it does:

1. validates required icons and manifest files
2. validates Android signing inputs
3. optionally bumps `version.json`
4. runs the web build
5. syncs Capacitor Android
6. runs `bundleRelease`

Expected AAB output:

- `android/app/build/outputs/bundle/release/app-release.aab`

## Upload to Play internal testing

Use:

- `npm run release:android:internal`

Or run the builder directly with custom flags:

- `node scripts/build-android-release.js --bump --upload --track internal --status completed`

## Release notes

Default release notes directory:

- `play/release-notes`

Add locale-specific files like:

- `play/release-notes/en-US/latest.txt`
- `play/release-notes/en-US/3.0.0.txt`

Version-specific notes win over `latest.txt`.

## Common flags

- `--bump`
- `--upload`
- `--track <internal|alpha|beta|production>`
- `--status <completed|draft|halted|inProgress>`
- `--user-fraction <0-1>`
- `--credentials <path>`
- `--aab <path>`
- `--release-notes-dir <dir>`
- `--skip-build`
- `--skip-sync`

## Recommended release order

1. run lint/tests/build locally
2. build AAB with `npm run release:android:bump`
3. smoke test the app on a real Android device
4. upload to internal testing
5. verify store listing assets and release notes
6. promote only after internal QA is clean
