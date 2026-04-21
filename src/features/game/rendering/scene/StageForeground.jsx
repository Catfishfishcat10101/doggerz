import { useRef } from "react";
import { Container, Sprite, useTick } from "@pixi/react";
import { Texture } from "pixi.js";
import { SCENE_LAYERS } from "./sceneLayers";
import { SCENE_ASSETS } from "./sceneAssetManifest";

function makeTexture(path) {
  return Texture.from(path);
}

export default function StageForeground({ layout, reduceMotion = false }) {
  const leavesBackRef = useRef(null);
  const leavesFrontRef = useRef(null);
  const grassRef = useRef(null);
  const elapsedRef = useRef(0);

  const leavesBackBase = {
    x: layout.treeLeavesBack.x + layout.treeLeavesBack.width * 0.5,
    y: layout.treeLeavesBack.y + layout.treeLeavesBack.height * 0.72,
  };

  const leavesFrontBase = {
    x: layout.treeLeavesFront.x + layout.treeLeavesFront.width * 0.5,
    y: layout.treeLeavesFront.y + layout.treeLeavesFront.height * 0.72,
  };

  const grassBase = {
    x: layout.foregroundGrass.x + layout.foregroundGrass.width * 0.5,
    y: layout.foregroundGrass.y + layout.foregroundGrass.height * 0.5,
  };

  useTick((delta) => {
    const back = leavesBackRef.current;
    const front = leavesFrontRef.current;
    const grass = grassRef.current;

    if (!back || !front || !grass) return;

    if (reduceMotion) {
      back.x = leavesBackBase.x;
      back.y = leavesBackBase.y;
      back.rotation = 0;

      front.x = leavesFrontBase.x;
      front.y = leavesFrontBase.y;
      front.rotation = 0;

      grass.x = grassBase.x;
      grass.y = grassBase.y;
      grass.rotation = 0;

      return;
    }

    elapsedRef.current += delta / 60;
    const t = elapsedRef.current;

    back.x = leavesBackBase.x + Math.sin(t * 0.8) * 1.5;
    back.y = leavesBackBase.y + Math.sin(t * 0.55) * 0.8;
    back.rotation = Math.sin(t * 0.7) * 0.012;

    front.x = leavesFrontBase.x + Math.sin(t * 1.05) * 2.5;
    front.y = leavesFrontBase.y + Math.sin(t * 0.7) * 1.1;
    front.rotation = Math.sin(t * 0.95) * 0.02;

    grass.x = grassBase.x + Math.sin(t * 0.9) * 2;
    grass.y = grassBase.y + Math.sin(t * 0.65) * 1.2;
    grass.rotation = Math.sin(t * 0.85) * 0.008;
  });

  return (
    <Container sortableChildren>
      <Sprite
        texture={makeTexture(SCENE_ASSETS.shared.treeTrunk)}
        x={layout.treeTrunk.x}
        y={layout.treeTrunk.y}
        width={layout.treeTrunk.width}
        height={layout.treeTrunk.height}
        zIndex={SCENE_LAYERS.FOREGROUND_PROPS}
      />

      <Container
        ref={leavesBackRef}
        x={leavesBackBase.x}
        y={leavesBackBase.y}
        zIndex={SCENE_LAYERS.FOREGROUND_PROPS + 1}
      >
        <Sprite
          texture={makeTexture(SCENE_ASSETS.shared.treeLeavesBack)}
          anchor={{ x: 0.5, y: 0.72 }}
          width={layout.treeLeavesBack.width}
          height={layout.treeLeavesBack.height}
        />
      </Container>

      <Container
        ref={leavesFrontRef}
        x={leavesFrontBase.x}
        y={leavesFrontBase.y}
        zIndex={SCENE_LAYERS.FOREGROUND_PROPS + 2}
      >
        <Sprite
          texture={makeTexture(SCENE_ASSETS.shared.treeLeavesFront)}
          anchor={{ x: 0.5, y: 0.72 }}
          width={layout.treeLeavesFront.width}
          height={layout.treeLeavesFront.height}
        />
      </Container>

      <Container
        ref={grassRef}
        x={grassBase.x}
        y={grassBase.y}
        zIndex={SCENE_LAYERS.FOREGROUND_GRASS}
      >
        <Sprite
          texture={makeTexture(SCENE_ASSETS.shared.foregroundGrass)}
          anchor={0.5}
          width={layout.foregroundGrass.width}
          height={layout.foregroundGrass.height}
        />
      </Container>
    </Container>
  );
}
