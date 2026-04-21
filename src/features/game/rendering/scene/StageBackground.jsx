import { Container, Sprite } from "@pixi/react";
import { Texture } from "pixi.js";
import { SCENE_LAYERS } from "./sceneLayers";
import { SCENE_ASSETS } from "./sceneAssetManifest";

function makeTexture(path) {
  return Texture.from(path);
}

export default function StageBackground({ theme, layout }) {
  const skyPath =
    theme.mode === "night" ? SCENE_ASSETS.night.sky : SCENE_ASSETS.day.sky;

  return (
    <Container sortableChildren>
      <Sprite
        texture={makeTexture(skyPath)}
        x={layout.sky.x}
        y={layout.sky.y}
        width={layout.sky.width}
        height={layout.sky.height}
        zIndex={SCENE_LAYERS.SKY}
        tint={theme.skyTint}
      />

      <Sprite
        texture={makeTexture(SCENE_ASSETS.shared.farHills)}
        x={layout.farHills.x}
        y={layout.farHills.y}
        width={layout.farHills.width}
        height={layout.farHills.height}
        zIndex={SCENE_LAYERS.FAR_BACKGROUND}
        alpha={0.95}
      />

      <Sprite
        texture={makeTexture(SCENE_ASSETS.shared.fenceYard)}
        x={layout.fenceYard.x}
        y={layout.fenceYard.y}
        width={layout.fenceYard.width}
        height={layout.fenceYard.height}
        zIndex={SCENE_LAYERS.MID_BACKGROUND}
      />

      <Sprite
        texture={makeTexture(SCENE_ASSETS.shared.doghouse)}
        x={layout.doghouse.x}
        y={layout.doghouse.y}
        width={layout.doghouse.width}
        height={layout.doghouse.height}
        zIndex={SCENE_LAYERS.MID_BACKGROUND + 1}
      />

      <Sprite
        texture={makeTexture(SCENE_ASSETS.shared.groundBase)}
        x={layout.groundBase.x}
        y={layout.groundBase.y}
        width={layout.groundBase.width}
        height={layout.groundBase.height}
        zIndex={SCENE_LAYERS.GROUND}
        tint={theme.groundTint}
      />
    </Container>
  );
}
