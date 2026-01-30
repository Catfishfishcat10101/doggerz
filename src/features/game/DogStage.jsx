/** @format */
// src/features/game/DogStage.jsx

import { Component, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DogPixiView from "@/components/DogPixiView.jsx";
import DogCanvas from "@/features/dog/DogCanvas.jsx";
import {
  getDogPixiSheetUrl,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";
import { selectSettings } from "@/redux/settingsSlice.js";

const STAGE_HEIGHT = 360;

class PixiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    this.props.onError?.(err);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      // Reset error boundary when the stage/condition/anim changes.
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback || null;
    return this.props.children;
  }
}

export default function DogStage({ dog, scene }) {
  const settings = useSelector(selectSettings);
  const frameLabel = dog?.lifeStage?.label || "Puppy";
  const stage = dog?.lifeStage?.stage || dog?.stage || "PUPPY";
  const condition = dog?.cleanlinessTier || "clean";
  const anim = dog?.isAsleep ? "sleep" : dog?.lastAction || "idle";
  const [pixiFailed, setPixiFailed] = useState(false);

  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const useStaticAnim = reduceMotion ? "idle" : anim;

  const pixiSheetUrl = useMemo(
    () => getDogPixiSheetUrl(stage, condition),
    [condition, stage]
  );
  const pixiFallbackUrl = useMemo(() => getDogStaticSpriteUrl(stage), [stage]);

  const resetKey = `${stage}-${condition}-${useStaticAnim}`;

  useEffect(() => {
    setPixiFailed(false);
  }, [resetKey]);

  const handlePixiStatus = useCallback((status) => {
    if (!status) return;
    if (status === "error") {
      setPixiFailed(true);
    }
  }, []);

  const showPixi = !pixiFailed;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#05070d] via-[#07090f] to-black/70 shadow-[0_35px_120px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/80" />
      {reduceMotion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      ) : null}

      <div className="relative z-10 flex min-h-[320px] items-center justify-center px-3 py-6 sm:min-h-[360px] lg:min-h-[420px]">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="relative flex justify-center">
            <div className="dz-stage-floating">
              <div
                aria-hidden
                className="dz-stage-shadow pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2 z-0"
              />
              <div className="relative z-10">
                {showPixi ? (
                  <PixiErrorBoundary
                    resetKey={resetKey}
                    onError={() => setPixiFailed(true)}
                    fallback={null}
                  >
                    <DogPixiView
                      stage={stage}
                      condition={condition}
                      anim={useStaticAnim}
                      width={900}
                      height={STAGE_HEIGHT}
                      scale={2.4}
                      onStatusChange={handlePixiStatus}
                    />
                  </PixiErrorBoundary>
                ) : (
                  <DogCanvas
                    sheetUrl={pixiSheetUrl}
                    imageUrl={pixiFallbackUrl}
                    animation={useStaticAnim}
                    height={STAGE_HEIGHT}
                    className="w-full max-w-[900px]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 pb-5 pt-3 text-[11px] uppercase tracking-[0.35em] text-white/60">
        <span>{dog?.name || "Pup"}</span>
        <span>{scene?.label || "Backyard"}</span>
        <span>{scene?.timeOfDay || "Night"}</span>
        <span
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em]"
          style={scene?.weatherAccent ? { color: scene.weatherAccent } : null}
        >
          {scene?.weather || "Clear"}
        </span>
        <span className="text-[10px] text-white/40">{frameLabel}</span>
      </div>
    </section>
  );
}
