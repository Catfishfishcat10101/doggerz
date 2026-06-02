Original prompt: implement, modify, or delete anything else you can think of that is keeping this from being a proffesional download on the play store.

Progress:

- Found Settings imports a missing `src/features/settings/DataDeletion.jsx`, which can crash the settings route.
- Found Android release config uses `com.google.android.gms:play-services-games-v2:+`; pinned versions are safer for reproducible Play Store builds.
- Found AdMob test IDs wired into production-facing Android config while privacy copy says no third-party ads.
- Added missing Settings data deletion controls for cloud save, Firebase account, local data, and email fallback.
- Removed the AdMob native plugin/dependency path and the daily reward ad button so the app matches the no-ads privacy stance.
- Added missing `checkIn.js` and `dogSpritePaths.js` utilities that were blocking production builds.
- `npm run build` passes after the fixes.
- `npx cap sync android` passes and Android sync no longer includes the AdMob plugin.
- `android/gradlew assembleDebug` timed out locally after 3 minutes; Gradle daemon was stopped. Local Java is 17.0.19.
- Browser smoke test via develop-web-game client showed the adoption preview dog was clipped; fixed `HeroDog3D` scene-only embedding and verified the dog is now visible in `output/playstore-smoke-3/shot-1.png`.

TODO:

- Verify the yard visually in a browser after this release-readiness pass.
- Replace placeholder support website/contact URLs with the final public Doggerz domain before Play Store submission.
