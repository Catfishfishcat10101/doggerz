# Play Store assets

This folder is for *store listing* assets (not shipped inside the app bundle).

## Screenshots (Google Play)

Google Play requires **4–8 screenshots** that are:

- PNG or JPEG
- up to 15 MB each
- **16:9 or 9:16** aspect ratio
- each side between 720 px and 7,680 px

### Quick workflow

1. Put your raw captures here:
   - `store-assets/play/screenshots-in/`

   Supported input types: `png`, `jpg`, `jpeg`, `webp`.

2. Generate Play-ready screenshots:

   - Landscape phone preset (default): 1920×1080
   - Portrait phone preset: 1080×1920

   Run:
   - `node scripts/generate-play-screenshots.js`

   Outputs will be written to:
   - `store-assets/play/screenshots-out/`

### Tips to get 4–8 great screenshots

Aim for different "moments" (your UI is already strong):

- Main game screen (needs + actions)
- Training panel / voice mode
- Journal / mood history
- Store / upgrades (if present)
- Settings (show customization)
- A “cute dog moment” (celebration / sleep)

Keep UI readable: prefer 1080p+ and avoid tiny text.
