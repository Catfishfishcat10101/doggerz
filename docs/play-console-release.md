# Play Console Release Automation

Doggerz uses a Node-based Google Play Developer API uploader so Android releases can stay inside the existing JavaScript toolchain.

## What This Does

- uploads the signed `.aab`
- applies release notes from `play/release-notes/<locale>/<version>.txt`
- updates a chosen Play track
- commits the Play edit

## Files

- uploader: `scripts/upload-play-release.js`
- release notes: `play/release-notes/en-US/2.1.0.txt`

## Service Account Setup

1. Create or choose a Google Cloud service account for Play publishing.
2. Create a JSON key for that service account.
3. In Google Play Console, grant that service account app access with release permissions for Doggerz.
4. Store the JSON key outside the repo or in a local ignored path.
5. Set one of these environment variables before uploading:
   - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   - `GOOGLE_APPLICATION_CREDENTIALS`

Example PowerShell:

```powershell
$env:GOOGLE_PLAY_SERVICE_ACCOUNT_JSON="C:\secrets\doggerz-play-service-account.json"
```

## Build The Bundle

```powershell
npm run android:sync
cd android
.\gradlew.bat :app:bundleRelease --console=plain
cd ..
```

Bundle output:

`android/app/build/outputs/bundle/release/app-release.aab`

## Upload Commands

Safe default, internal track:

```powershell
npm run play:upload:internal
```

Explicit production staged rollout:

```powershell
npm run play:upload -- --track production --status inProgress --user-fraction 0.05
```

Promote a fully completed production release:

```powershell
npm run play:upload -- --track production --status completed
```

## Script Options

- `--credentials <path>`: service account JSON path
- `--aab <path>`: custom bundle path
- `--package <applicationId>`: defaults to `com.doggerz.app`
- `--track <track>`: defaults to `internal`
- `--status <completed|draft|halted|inProgress>`: defaults to `completed`
- `--user-fraction <0-1>`: required for `inProgress`
- `--release-name <label>`: defaults to `version.json` `versionName`
- `--release-notes-dir <dir>`: defaults to `play/release-notes`

## Release Notes Workflow

Put locale-specific notes here:

`play/release-notes/<locale>/<version>.txt`

Example:

`play/release-notes/en-US/2.1.0.txt`

If a locale file for the exact version does not exist, the uploader falls back to `latest.txt` in that locale folder.
