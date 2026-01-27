# Visual hierarchy checklist (before → after)

1. **Layout structure**
   - _Before:_ Single-column gameplay column keeping Game actions and Training panel stacked vertically inside `<main>`; limited visual rhythm.
   - _After:_ Zigzag grid (7+5 column split) alternating Dog stage, Needs HUD, training stack, and action cluster to guide the eye in a diagonal snaking pattern.

2. **Needs HUD**
   - _Before:_ Simplified stacked bars with dim secondary tiles.
   - _After:_ Glassy panel with layered gradients, dominant/low need callout, circular meters, and proportionally sized tiles for clarity.

3. **Dog stage**
   - _Before:_ Static black box with Pixi view.
   - _After:_ Deep, multi-layered shell, animated floating container, glow overlays, and contextual footer to anchor the scene.

4. **Training experience**
   - _Before:_ Minimal list of command buttons and voice action stacked inside the same column as the needs HUD.
   - _After:_ Elevated training deck with clear header, detailed command cards, success stats, CTA button, and integrated voice training tile inside a dedicated panel/column.

5. **Action cluster**
   - _Before:_ Simple `Panel` with grid of buttons.
   - _After:_ Highlight card with neon-inspired border, brief copy, and call-to-action icons to reinforce immediacy.
