import { Container } from "@pixi/react";
import AnimatedDog from "./AnimatedDog";

export default function DogRenderer({
  dog,
  x = 0,
  y = 0,
  currentAction = "idle",
  mood = "content",
  paused = false,
  reduceMotion = false,
}) {
  return (
    <Container x={x} y={y} zIndex={60} sortableChildren>
      <AnimatedDog
        dog={dog}
        currentAction={currentAction}
        mood={mood}
        paused={paused}
        reduceMotion={reduceMotion}
      />
    </Container>
  );
}
