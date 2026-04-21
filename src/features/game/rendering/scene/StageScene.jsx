import { Container } from "@pixi/react";
import { getSceneTheme } from "./sceneTheme";
import { getSceneLayout } from "./sceneLayout";
import StageBackground from "./StageBackground";
import StageForeground from "./StageForeground";
import StageLighting from "./StageLighting";
import DogShadow from "./DogShadow";

export default function StageScene({
  width,
  height,
  isNight,
  weather,
  reduceMotion = false,
  children,
}) {
  const theme = getSceneTheme({ isNight, weather });
  const layout = getSceneLayout(width, height);

  return (
    <Container sortableChildren>
      <StageBackground theme={theme} layout={layout} />

      <StageLighting
        theme={theme}
        layout={layout}
        reduceMotion={reduceMotion}
      />

      <DogShadow x={layout.dogAnchor.x} y={layout.dogAnchor.y + 20} scale={1} />

      {children}

      <StageForeground layout={layout} reduceMotion={reduceMotion} />
    </Container>
  );
}
