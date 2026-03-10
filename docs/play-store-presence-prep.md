# Doggerz Play Store Presence Prep

## 1 App Icon Audit

### Current state in repo

- Web icons exist and are correctly sized:
  - `public/assets/icons/icon-192.png` -> `192x192`
  - `public/assets/icons/icon-512.png` -> `512x512`
- Android launcher mipmaps exist for standard densities:
  - `android/app/src/main/res/mipmap-*/ic_launcher.png`
  - `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
- Adaptive icon wrappers are configured:
  - `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
  - `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

### Critical finding

- `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml` is still the default Android vector foreground, not Doggerz branding.
- Result: the adaptive icon path can still render as generic Android branding on some launchers/devices.

### Action to complete icon prep

1. Replace adaptive foreground with Doggerz art:
   - Option A: replace `ic_launcher_foreground.xml` with Doggerz vector.
   - Option B: point adaptive icon foreground to branded PNG layers.
2. Keep safe-zone padding for adaptive icons (avoid clipping around edges).
3. Rebuild and sync:
   - `npm run build`
   - `npm run android:sync`
4. Validate on at least one Android 13+ and one Android 15+ emulator/device.

---

## 2 Screenshot Capture Checklist (Google Play)

### Before capture

1. Use a production-like build state:
   - signed in
   - adopted dog present
   - no debug overlays, no placeholder toasts
2. Freeze noisy UI:
   - disable transient banners/toasts
   - set stable dog pose/scene for each shot
3. Ensure clean text:
   - no typo placeholders
   - no lorem ipsum
   - no dev-only labels

### Required image assets (Play listing)

1. App icon: `512x512` PNG, 32-bit, <= 1024 KB.
2. Feature graphic: `1024x500` JPG/PNG, no alpha.
3. Screenshots: minimum 2 screenshots across device types to publish.
4. Optional: tablet/Chromebook screenshots if you want those device listings polished.
5. Recommendation for app featuring surfaces: provide at least 4 phone screenshots at minimum `1080x1920` portrait or `1920x1080` landscape.

### Capture plan for Doggerz (recommended 8 phone screenshots)

1. Yard overview with dog visible and stat cards.
2. Feed/Play/Pet action row in active use.
3. Training or skill progression screen.
4. Cosmetics/store preview with equipped accessory.
5. Daily reward modal and streak context.
6. Settings with quality-of-life controls.
7. Treasure find or autonomy event in progress.
8. Senior/age progression or journal/memory surface.

### Capture workflow

1. Start web preview: `npm run dev:web:host`
2. Start Android target:
   - emulator or connected device
   - `npx cap run android -l --host 127.0.0.1 --port 5173`
3. Capture from emulator/device at native resolution.
4. Keep one visual style across all shots:
   - same brightness/contrast treatment
   - same UI density
   - same language locale

### Final QA checks on screenshots

1. No status bar clutter if avoidable.
2. No visible loading skeletons.
3. Dog is on-screen and readable in every shot.
4. Text remains legible at Play preview scale.
5. No references to unfinished or unreleased features.

---

## 3 Store Listing Copy Draft (US English)

### App name

`Doggerz`

### Short description (<= 80 chars)

`Adopt a virtual Jack Russell, train daily, and bond through life stages.`

### Full description draft

Adopt your own Jack Russell and raise them from playful puppy to loyal companion.

Doggerz is a living virtual pet game built around daily care, training, and personality. Your dog reacts to your routine, learns commands over time, and develops a bond based on how you play.

What you can do in Doggerz:

- Adopt and name your pup.
- Feed, bathe, train, and care for changing needs.
- Build command mastery with skill-based progression.
- Unlock cosmetics and personalize your dog.
- Discover surprise events, treasure hunts, and unpredictable behavior moments.
- Track your dog through life stages with evolving gameplay.

Designed for quick check-ins or longer sessions, Doggerz gives you a pet that feels active even when life gets busy.

Core loop:
Adopt. Train. Bond.

Notes:

- Some features may require network access for cloud save and account sync.
- Rewards and content availability can vary by build version.

### Optional promo text (if used)

`Raise a high-energy Jack Russell with real personality, training, and daily progression.`

---

## 4 Final Publish Pass

1. Confirm icon and feature graphic are final in Play Console.
2. Upload screenshot set in the same visual order as the feature flow.
3. Paste short and full description, then proofread once in preview.
4. Confirm policy links and contact details are present.
5. Verify the uploaded binary version is the same build represented by screenshots.
