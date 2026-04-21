import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Container } from "@pixi/react";
import StageScene from "./scene/StageScene";
import DogRenderer from "./DogRenderer";

const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 640;

function getSafeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export default function DogMobileCanvas({
  className = "",
  isNight = false,
  weather = "clear",
  dog = null,
  currentAction = "idle",
  mood = "content",
  paused = false,
  reduceMotion = false,
  onSceneReady,
}) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    const updateSize = () => {
      const nextWidth = Math.max(
        1,
        Math.floor(node.clientWidth || DEFAULT_WIDTH)
      );
      const nextHeight = Math.max(
        1,
        Math.floor(node.clientHeight || DEFAULT_HEIGHT)
      );

      setSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateSize();

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

  return (
    <div
      ref={hostRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
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
    </div>
  );
}
