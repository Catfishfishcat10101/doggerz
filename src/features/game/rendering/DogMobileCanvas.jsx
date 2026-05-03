<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Container } from "@pixi/react";
import StageScene from "./scene/StageScene";
import DogRenderer from "./DogRenderer";
=======
// src/features/game/rendering/DogMobileCanvas.jsx
import { Suspense, lazy, useEffect, useRef, useState } from "react";

const Dog3DScene = lazy(() =>
  import("@/components/game/Dog3DScene.jsx").then((module) => ({
    default: module.Dog3DScene,
  }))
);
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)

const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 640;

<<<<<<< HEAD
function getSafeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
=======
function DogMobileCanvasFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,#10233b_0%,#88b47d_58%,#314b2c_100%)]">
      <div className="h-16 w-28 rounded-[50%] bg-black/20 blur-xl" />
      <div className="absolute bottom-4 left-4 right-4 h-2 rounded-full bg-emerald-200/18" />
    </div>
  );
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
}

export default function DogMobileCanvas({
  className = "",
<<<<<<< HEAD
  isNight = false,
  weather = "clear",
  dog = null,
  currentAction = "idle",
  mood = "content",
  paused = false,
  reduceMotion = false,
=======
  scene = null,
  dog = null,
  brainState = null,
  renderModel = null,
  requestedAction = "",
  requestedFacing = "",
  mood = "content",
  paused = false,
  reduceMotion = false,
  scale = 1,
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
  onSceneReady,
}) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  useEffect(() => {
    const node = hostRef.current;
<<<<<<< HEAD
    if (!node) return;
=======
    if (!node) return undefined;
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)

    const updateSize = () => {
      const nextWidth = Math.max(
        1,
        Math.floor(node.clientWidth || DEFAULT_WIDTH)
      );
      const nextHeight = Math.max(
        1,
        Math.floor(node.clientHeight || DEFAULT_HEIGHT)
      );

<<<<<<< HEAD
      setSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
=======
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      );
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
    };

    updateSize();

<<<<<<< HEAD
    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(node);
    window.addEventListener("orientationchange", updateSize);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", updateSize);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (!onSceneReady) return;
    onSceneReady(size);
  }, [onSceneReady, size]);

  const dogPosition = useMemo(() => {
    const width = getSafeNumber(size.width, DEFAULT_WIDTH);
    const height = getSafeNumber(size.height, DEFAULT_HEIGHT);

    return {
      x: Math.round(width * 0.5),
      y: Math.round(height * 0.74),
    };
  }, [size]);
=======
    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onSceneReady?.(size);
  }, [onSceneReady, size]);

  const dogView = {
    dog,
    brainState,
    renderModel,
    requestedAction,
    requestedFacing,
    mood,
    paused,
    reduceMotion,
    scale,
  };
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)

  return (
    <div
      ref={hostRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
<<<<<<< HEAD
      <Stage
        width={size.width}
        height={size.height}
        options={{
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
        }}
        className="absolute inset-0"
      >
        <Container sortableChildren>
          <StageScene
            width={size.width}
            height={size.height}
            isNight={isNight}
            weather={weather}
            reduceMotion={reduceMotion}
          >
            <DogRenderer
              dog={dog}
              x={dogPosition.x}
              y={dogPosition.y}
              currentAction={currentAction}
              mood={mood}
              paused={paused}
              reduceMotion={reduceMotion}
            />
          </StageScene>
        </Container>
      </Stage>
=======
      <Suspense fallback={<DogMobileCanvasFallback />}>
        <Dog3DScene scene={scene} dogView={dogView} viewportSize={size} />
      </Suspense>
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
    </div>
  );
}
