<<<<<<< HEAD
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
=======
//src/features/game/rendering/DogRenderer.jsx
import Dog3D from "@/components/dog/Dog3D.jsx";

export default function DogRenderer({
  scene = null,
  dog = null,
  action = "",
  clip = "Idle",
  facing = "",
  animationClip = null,
  resolution = null,
  position = [0, -1, 0],
  rotation = [0, Math.PI * 0.15, 0],
  scale = 1,
  paused = false,
  reduceMotion = false,
  ghost = false,
}) {
  return (
    <Dog3D
      scene={scene}
      dog={dog}
      action={action}
      facing={facing}
      animationClip={animationClip}
      resolution={resolution}
      desiredClip={clip}
      position={position}
      rotation={rotation}
      scale={scale}
      paused={paused}
      reduceMotion={reduceMotion}
      ghost={ghost}
    />
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
  );
}
