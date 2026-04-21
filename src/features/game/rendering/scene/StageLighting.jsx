import { useRef } from "react";
import { Container, Sprite, useTick } from "@pixi/react";
import { Texture } from "pixi.js";
import { SCENE_LAYERS } from "./sceneLayers";
import { SCENE_ASSETS } from "./sceneAssetManifest";

function makeTexture(path) {
  return Texture.from(path);
}

export default function StageLighting({ theme, layout, reduceMotion = false }) {
  const glowRef = useRef(null);
  const elapsedRef = useRef(0);

  useTick((delta) => {
    const glow = glowRef.current;

    if (!glow || theme.mode !== "night") return;

    if (reduceMotion) {
      glow.alpha = theme.glowAlpha;
      glow.y = 0;
      return;
    }

    elapsedRef.current += delta / 60;
    const t = elapsedRef.current;

    glow.alpha = theme.glowAlpha + Math.sin(t * 1.15) * 0.04;
    glow.y = Math.sin(t * 0.28) * 1.5;
  });

  if (theme.mode !== "night") {
    return null;
  }

  return (
    <Container sortableChildren>
      <Sprite
        ref={glowRef}
        texture={makeTexture(SCENE_ASSETS.night.glow)}
        x={0}
        y={0}
        width={layout.stage.width}
        height={layout.stage.height}
        zIndex={SCENE_LAYERS.LIGHTING}
        alpha={theme.glowAlpha}
      />
    </Container>
  );
}
