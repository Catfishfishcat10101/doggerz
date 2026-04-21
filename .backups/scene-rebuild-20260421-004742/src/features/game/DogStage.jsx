import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DogMobileCanvas from "@/features/game/rendering/DogMobileCanvas.jsx";
import { resolveDogBrain } from "@/features/game/rendering/DogBrain.js";
import SceneHud from "@/features/game/rendering/SceneHud.jsx";
import YardScene from "@/features/game/rendering/YardScene.jsx";
import { getSceneLayout } from "@/features/game/rendering/sceneLayout.js";
import { useDogGameView } from "@/hooks/useDogState.js";

const FALLBACK_VIEWPORT_MIN_HEIGHT = 420;

function assignRef(ref, value) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

function resolveHudTone(tone = "neutral") {
  const key = String(tone || "neutral")
    .trim()
    .toLowerCase();
  if (["ok", "success", "emerald"].includes(key)) return "emerald";
  if (["pending", "warning", "amber"].includes(key)) return "warning";
  if (["error", "danger", "rose"].includes(key)) return "danger";
  if (["sky", "info"].includes(key)) return "sky";
  return "neutral";
}

const DogStage = forwardRef(function DogStage(
  {
    scene = null,
    environment = "yard",
    isNight = false,
    weather = "clear",
    reduceMotion = false,
    dogName = "Your pup",
    stageLabel = "Puppy",
    conditionLabel = "Content",
    conditionTone = "emerald",
    syncLabel = "Save",
    syncDetail = "Ready",
    syncTone = "neutral",
    dogPositionNorm = null,
    investigationProps = [],
    activePropId = "",
    onPropTap = undefined,
    pawPrints = [],
    fireflySeeds = [],
    showFireflies = false,
    placingBowl = false,
    dogSleepingInDoghouse = false,
    dogScaleBias = 0.95,
    animationSpeedMultiplier = 1,
    idleAnimationIntensity = "calm",
    requestedAnimation = "",
    containerClassName = "",
    rendererClassName = "",
    rendererMinHeight = undefined,
    viewportMinHeight = FALLBACK_VIEWPORT_MIN_HEIGHT,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    id,
  },
  forwardedRef
) {
  const { dog, renderModel } = useDogGameView();
  const localRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ width: 960, height: 540 });
  const resolvedViewportMinHeight = useMemo(() => {
    const value = Number(viewportMinHeight);
    if (!Number.isFinite(value) || value <= 0) {
      return FALLBACK_VIEWPORT_MIN_HEIGHT;
    }
    return Math.max(320, Math.round(value));
  }, [viewportMinHeight]);

  const setViewportRef = useCallback(
    (node) => {
      localRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  const measureViewport = useCallback(
    (entry = null) => {
      const node = localRef.current;
      if (!node) return;

      const fallbackRect =
        typeof node.getBoundingClientRect === "function"
          ? node.getBoundingClientRect()
          : null;

      const widthFromEntry = Number(entry?.contentRect?.width || 0);
      const heightFromEntry = Number(entry?.contentRect?.height || 0);
      const widthFromNode = Number(
        node.clientWidth || fallbackRect?.width || 0
      );
      const heightFromNode = Number(
        node.clientHeight || fallbackRect?.height || 0
      );

      const nextWidth = Math.max(
        320,
        Math.round(widthFromEntry || widthFromNode || 960)
      );
      const nextHeight = Math.max(
        resolvedViewportMinHeight,
        Math.round(
          heightFromEntry || heightFromNode || resolvedViewportMinHeight
        )
      );

      setViewportSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      );
    },
    [resolvedViewportMinHeight]
  );

  useEffect(() => {
    measureViewport();

    const node = localRef.current;
    if (!node) return undefined;

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver((entries) => {
        measureViewport(entries[0]);
      });

      resizeObserver.observe(node);
      return () => {
        resizeObserver.disconnect();
      };
    }

    if (typeof window === "undefined") return undefined;

    const onResize = () => {
      measureViewport();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [measureViewport]);

  const sceneLayout = useMemo(
    () =>
      getSceneLayout({
        width: viewportSize.width,
        height: viewportSize.height,
        dogPositionNorm,
        dogSleepingInDoghouse,
      }),
    [
      dogPositionNorm,
      dogSleepingInDoghouse,
      viewportSize.height,
      viewportSize.width,
    ]
  );

  const sceneHudLeft = useMemo(
    () => [
      {
        label: "Mood",
        value: conditionLabel || "Content",
        tone: resolveHudTone(conditionTone || "emerald"),
      },
      { label: "Stage", value: stageLabel || "Puppy", tone: "neutral" },
    ],
    [conditionLabel, conditionTone, stageLabel]
  );
  const sceneHudRight = useMemo(
    () => [
      { label: "Weather", value: String(weather || "Clear"), tone: "sky" },
      {
        label: syncLabel || "Save",
        value: syncDetail || "Ready",
        tone: resolveHudTone(syncTone || "neutral"),
      },
    ],
    [syncDetail, syncLabel, syncTone, weather]
  );

  const sectionClassName =
    containerClassName || "relative isolate w-full h-full overflow-hidden";
  const dogRendererClassName =
    rendererClassName || "absolute inset-0 pointer-events-none";
  const sectionStyle = useMemo(
    () => ({
      minHeight: `${resolvedViewportMinHeight}px`,
      width: "100%",
      height: "100%",
    }),
    [resolvedViewportMinHeight]
  );

  const brainState = useMemo(
    () => resolveDogBrain({ dog, renderModel }),
    [dog, renderModel]
  );
  return (
    <section
      ref={setViewportRef}
      id={id}
      className={sectionClassName}
      style={sectionStyle}
    >
      <div
        className="absolute inset-0 z-[20]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <YardScene
          layout={sceneLayout}
          environment={environment}
          isNight={isNight || scene?.isNight === true}
          weather={weather || scene?.weatherKey || scene?.weather || "clear"}
          reduceMotion={reduceMotion}
          investigationProps={investigationProps}
          activePropId={activePropId}
          onPropTap={onPropTap}
          pawPrints={pawPrints}
          fireflySeeds={fireflySeeds}
          showFireflies={showFireflies}
          showBowlHint={placingBowl}
        />
      </div>

      <DogMobileCanvas
        dog={dog}
        renderModel={renderModel}
        brainState={brainState}
        requestedAction={requestedAnimation}
        sceneLayout={sceneLayout}
        reduceMotion={reduceMotion}
        dogScaleBias={dogScaleBias}
        dogSleepingInDoghouse={dogSleepingInDoghouse}
        idleAnimationIntensity={idleAnimationIntensity}
        animationSpeedMultiplier={animationSpeedMultiplier}
        rendererClassName={dogRendererClassName}
        rendererMinHeight={rendererMinHeight ?? resolvedViewportMinHeight}
      />

      <SceneHud leftItems={sceneHudLeft} rightItems={sceneHudRight} />

      <div className="pointer-events-none absolute left-4 bottom-3 z-[34] rounded-full border border-white/10 bg-black/28 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/66 backdrop-blur-sm">
        {dogName}
      </div>
    </section>
  );
});

export default DogStage;
