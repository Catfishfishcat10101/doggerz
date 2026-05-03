<!-- docs/jackrussell-doggerz-asset-spec.md -->

# Jack Russell GLB Asset Spec

Canonical asset path:

- `public/assets/models/dog/jackrussell-doggerz.glb`

Purpose:

- This is the single dog asset source of truth for the main game stage.
- The React app remains the app shell.
- R3F renders the dog stage.
- Redux decides the dog's current animation intent.

## Required

- One clean Jack Russell dog mesh, or the smallest intentional set of skinned meshes needed for materials.
- One armature/rig.
- Exact clip names:
  - `Idle`
  - `Walk`
  - `Walk_Left`
  - `Walk_Right`
  - `Turn_Walk_Left`
  - `Turn_Walk_Right`
  - `Bark`
  - `Scratch`
  - `Sleep`
  - `Sit`
  - `Wag`
  - `Eat`
  - `Lay_Down`
  - `Jump`
  - `Fetch`
  - `Beg`
  - `Paw`
  - `Shake`
  - `HighFive`
  - `Dance`
  - `GateWatch`
  - `Idle_Resting`
  - `Light_Sleep`
  - `Deep_Rem_Sleep`
  - `Drink`
  - `Sniff`
  - `Lethargic_Lay`
- Clean pivots.
- Consistent scale.
- Optimized textures.
- No unnecessary bones.
- No junk meshes, helper objects, cameras, or lights.

## Rig Rules

- One exported skin/rig is preferred.
- Export only deform bones and any strictly necessary driver bones.
- Remove IK helpers, target empties, hidden authoring objects, unused controllers, and test geometry.
- Root should be stable and predictable across exports.

## Clip Rules

- The exported GLB must contain named clips in the exact capitalization listed above.
- Clips should loop cleanly where appropriate:
  - `Idle`
  - `Walk`
  - `Walk_Left`
  - `Walk_Right`
  - `Sleep`
  - `Wag`
  - `Scratch`
  - `Eat`
  - `Drink`
  - `Sniff`
  - `GateWatch`
  - `Idle_Resting`
  - `Light_Sleep`
  - `Deep_Rem_Sleep`
- `Bark` may be a short looping or one-shot-friendly clip, but it must still export as a named animation clip.
- Do not export extra throwaway test clips.

## Transform Rules

- Keep the dog facing forward consistently across exports.
- Keep the asset grounded at world origin with a clean root.
- Root and main exported nodes should keep scale at `1,1,1`.
- Avoid baking arbitrary offsets into top-level nodes.

## Mesh Rules

- Prefer one hero mesh.
- If multiple meshes are necessary, keep them intentional and minimal.
- Remove duplicate meshes, hidden meshes, backup meshes, proxy meshes, and authoring leftovers.

## Texture Rules

- Optimize for a premium pet-stage presentation, not realism overload.
- Keep texture sizes modest and mobile-safe.
- Avoid giant texture maps unless there is a proven need.
- Prefer a small, clean material set over many fragmented materials.

## Scene Rules

- Do not export cameras.
- Do not export lights.
- Do not export environment geometry.
- The GLB should contain the dog only.

## Validation Targets

The local validator checks for:

- file presence
- valid GLB container structure
- meshes
- skins/joints
- animation clip names
- root scale and transform heuristics
- cameras/lights
- suspicious junk node names
- excessive bone counts

Run:

```bash
npm run validate:dog-glb
```

Or with an explicit file:

```bash
node scripts/validate-dog-glb.js public/assets/models/dog/jackrussell-doggerz.glb
```
