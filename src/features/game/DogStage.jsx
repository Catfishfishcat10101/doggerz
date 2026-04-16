import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DogStatusBubble,
  ModernStatusPill,
} from "@/components/game/MainGamePanels.jsx";
import DogMobileCanvas from "@/features/game/rendering/DogMobileCanvas.jsx";
import AnimatedStageBackground from "@/features/game/rendering/AnimatedStageBackground.jsx";
import GameViewportThreeLayer from "@/features/game/rendering/GameViewportThreeLayer.jsx";
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

function resolveStageFeedbackClasses(tone = "neutral") {
  const key = String(tone || "neutral")
    .trim()
    .toLowerCase();

  if (["ok", "success", "emerald"].includes(key)) {
    return "border-emerald-300/32 bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(6,10,20,0.9))] text-emerald-50";
  }
  if (["pending", "warning", "warn", "amber"].includes(key)) {
    return "border-amber-300/34 bg-[linear-gradient(180deg,rgba(251,191,36,0.22),rgba(6,10,20,0.9))] text-amber-50";
  }
  if (["danger", "error", "rose"].includes(key)) {
    return "border-rose-300/34 bg-[linear-gradient(180deg,rgba(244,63,94,0.22),rgba(6,10,20,0.9))] text-rose-50";
  }
  if (["sky", "info"].includes(key)) {
    return "border-sky-300/32 bg-[linear-gradient(180deg,rgba(56,189,248,0.2),rgba(6,10,20,0.9))] text-sky-50";
  }
  return "border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(6,10,20,0.9))] text-doggerz-bone";
}

function StageFeedbackPill({ feedback }) {
  if (!feedback?.message) return null;

  return (
    <div
      className={`mx-auto w-full max-w-[440px] rounded-[20px] border px-3.5 py-2.5 shadow-[0_18px_42px_rgba(2,6,23,0.34)] backdrop-blur-2xl ${resolveStageFeedbackClasses(
        feedback.tone
      )}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/14 bg-black/18 text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {feedback.icon || "✨"}
        </div>
        <div className="min-w-0">
          {feedback.label ? (
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-current/80">
              {feedback.label}
            </div>
          ) : null}
          <div className="mt-0.5 text-[12px] font-semibold leading-5 text-current">
            {feedback.message}
          </div>
        </div>
      </div>
    </div>
  );
}

const DogStage = forwardRef(function DogStage(
  {
    scene = null,
    environment = "yard",
    isNight = false,
    weather = "clear",
    reduceMotion = false,
    dogName = "",
    stageLabel = "Puppy",
    ageValue = "0w",
    energyPct = 100,
    conditionLabel = "Content",
    conditionTone = "emerald",
    syncLabel = "Save",
    syncDetail = "Ready",
    syncTone = "neutral",
    statusPills = [],
    stageFeedback = null,
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
  const stageWeather =
    scene?.weatherLabel || scene?.weatherKey || scene?.weather || weather;
  const stageHeight = Math.max(
    resolvedViewportMinHeight,
    Number(viewportSize?.height || 0)
  );
  const hasStatusBubble = Boolean(dogName || stageLabel || conditionLabel);
  const visibleStatusPills = Array.isArray(statusPills)
    ? statusPills.filter((pill) => pill && pill.label && pill.value)
    : [];
  return (
    <section
      ref={setViewportRef}
      id={id}
      className={sectionClassName}
      style={sectionStyle}
    >
      <AnimatedStageBackground
        backgroundSrc={scene?.backgroundSrc || ""}
        weather={stageWeather}
        isNight={isNight || scene?.isNight === true}
        intensity={scene?.weatherIntensity ?? 0.75}
        height={stageHeight}
        className="h-full w-full rounded-none ring-0"
      >
        <GameViewportThreeLayer className="z-[12] opacity-60 mix-blend-screen" />

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

        {hasStatusBubble || visibleStatusPills.length ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[34] px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
              {hasStatusBubble || visibleStatusPills.length ? (
                <div className="flex flex-wrap items-end justify-between gap-2.5">
                  {hasStatusBubble ? (
                    <div className="pointer-events-auto max-w-full">
                      <DogStatusBubble
                        name={dogName}
                        stageLabel={stageLabel}
                        ageValue={ageValue}
                        moodLabel={conditionLabel}
                        energyPct={energyPct}
                      />
                    </div>
                  ) : (
                    <div />
                  )}

                  {visibleStatusPills.length ? (
                    <div className="pointer-events-auto flex max-w-full flex-wrap justify-end gap-2">
                      {visibleStatusPills.map((pill) => (
                        <ModernStatusPill
                          key={`${pill.label}-${pill.value}`}
                          label={pill.label}
                          value={pill.value}
                          detail={pill.detail}
                          tone={pill.tone}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {stageFeedback?.message ? (
                <div className="pointer-events-none">
                  <StageFeedbackPill feedback={stageFeedback} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </AnimatedStageBackground>
    </section>
  );
});

export default DogStage;
