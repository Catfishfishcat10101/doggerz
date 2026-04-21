import { Graphics } from "@pixi/react";
import { SCENE_LAYERS } from "./sceneLayers";

export default function DogShadow({ x, y, scale = 1 }) {
  const width = 70 * scale;
  const height = 18 * scale;

  return (
    <Graphics
      zIndex={SCENE_LAYERS.DOG_SHADOW}
      draw={(g) => {
        g.clear();
        g.beginFill(0x000000, 0.18);
        g.drawEllipse(x, y, width, height);
        g.endFill();
      }}
    />
  );
}
