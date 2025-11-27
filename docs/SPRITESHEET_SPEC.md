# SPRITESHEET_SPEC

Purpose

- Canonical specification for Doggerz sprite sheets so artists and engineers produce compatible assets.

Location

- Place sheet files under `src/assets/sprites/jackrussell/`.

File naming

- Base pattern: `jack_russell_{stage}{_suffix}.{ext}`
  - `{stage}`: `puppy`, `adult`, `senior` (lowercase)
  - `{_suffix}` (optional): cleanliness variant or variant token, examples:
    - `_dirty`, `_fleas`, `_mange`
    - no suffix = the `FRESH` canonical sheet for that stage
  - `{ext}`: preferred order: `.svg` / `_hd.svg` (vector sources), then `.png` (raster), and optional `.webp` sibling for optimized builds

Examples

- `jack_russell_puppy_hd.svg` (preferred high-quality vector for puppy fresh sheet)
- `jack_russell_adult.svg` (vector adult sheet)
- `jack_russell_senior.png` (raster senior fallback)
- `jack_russell_puppy_fleas.png` (cleanliness variant)
- `jack_russell_puppy.webp` (optional WebP sibling)

Grid & frames

- Frame size: 128 × 128 px (must be exact). All engine math assumes `frameSize = 128`.
- Grid: 16 columns × 16 rows (fills 2048 × 2048 px sheet). Sheets smaller than full 16×16 must still use 128px frames and consistent indexing.
- Frame indexing: column-major from top-left. Frame (x,y) where
  - `frameIndex = y * cols + x`
  - `frameX = frameIndex % cols`
  - `frameY = Math.floor(frameIndex / cols)`

Cleanliness variants

- Cleanliness overlays (`DIRTY`, `FLEAS`, `MANGE`) are expected to be provided as separate raster sheets (PNG or WebP). The engine prefers vector (SVG/HD) only for the `FRESH` sheet; cleanliness variants are raster because they are applied as overlays/particles and historically provided as PNG.

Asset priority at runtime

- For `FRESH` sheets the engine prefers, in order:
  1. `*_hd.svg` (if present)
  2. `*.svg`
  3. `*.webp` (if `VITE_PREFER_WEBP=1` and a sibling exists)
  4. `*.png`
- For cleanliness variants the engine prefers `.webp` (if enabled) then `.png` raster sheets.

Export & optimization recommendations

- When exporting raster sheets:
  - Produce lossless or visually lossless PNGs at 128px frames, no added padding.
  - Keep sheet dimensions exact multiples of 128.
  - Consider generating WebP siblings (`.webp`) for production; use `scripts/optimize-sprites.js` to create WebP and `tmp/opt-backup` copies.

Vector guidance (SVG)

- Keep the sheet viewBox aligned to the full sheet size (2048×2048) if possible; group frames with clear boundaries.
- Avoid embedded raster images inside SVG where possible; prefer vector shapes so scaling remains crisp.

LQIP & preview

- Provide a small HD-friendly SVG or a tiny 64×64 placeholder used as the inline LQIP. The engine includes a blurred LQIP fallback when full asset is loading.

Versioning & PR checklist for new/updated sprites

- Add new files under `src/assets/sprites/jackrussell/` following naming rules.
- Run locally:
  - `node scripts/verify-webp-sprites.js` to assert WebP coverage (optional)
  - `node scripts/optimize-sprites.js` to generate WebP and backups
- Visual verification:
  - `npm run visual:screenshots:start` to produce screenshots for the life-stage × cleanliness matrix.
- Commit the sprite files (include `.webp` siblings if you want the CI to prefer WebP).

CI integration notes

- The repo includes `scripts/verify-webp-sprites.js` and a GitHub workflow `visual-tests.yml` that runs the visual screenshot runner and the WebP verification step. If you don't produce `.webp` files, either run the optimizer before CI or unset `VITE_PREFER_WEBP` during builds.

Common pitfalls

- Do not change `frameSize` without updating engine constants.
- Avoid fractional frame offsets or extra gap pixels between frames — engine uses integer pixel math for background-position and relies on exact math to prevent seams.

Contact

- If you are contributing sprites, open a PR with exported files and a short note in the PR describing source (vector tool + export steps) and any deviations from spec.
