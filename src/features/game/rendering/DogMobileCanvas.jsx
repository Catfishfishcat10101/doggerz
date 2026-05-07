// src/features/game/rendering/DogMobileCanvas.jsx
import { Suspense, lazy, useEffect, useRef, useState } from "react";

const Dog3DScene = lazy(() =>
  import("@/components/game/Dog3DScene.jsx").then((module) => ({
    default: module.Dog3DScene,
  }))
);

const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 640;

function DogMobileCanvasFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,#10233b_0%,#88b47d_58%,#314b2c_100%)]">
      <div className="h-16 w-28 rounded-[50%] bg-black/20 blur-xl" />
      <div className="absolute bottom-4 left-4 right-4 h-2 rounded-full bg-emerald-200/18" />
    </div>
  );
}

export default function DogMobileCanvas({
  className = "",
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
  onSceneReady,
}) {
  const hostRef = useRef(null);
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      const nextWidth = Math.max(
        1,
        Math.floor(node.clientWidth || DEFAULT_WIDTH)
      );
      const nextHeight = Math.max(
        1,
        Math.floor(node.clientHeight || DEFAULT_HEIGHT)
      );

      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

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

  return (
    <div
      ref={hostRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      <Suspense fallback={<DogMobileCanvasFallback />}>
        <Dog3DScene scene={scene} dogView={dogView} viewportSize={size} />
      </Suspense>
    </div>
  );
}
