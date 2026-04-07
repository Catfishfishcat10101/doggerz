// src/components/layout/PageShell.jsx

import * as React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppShellContext } from "@/components/layout/AppShellContext.js";
import { selectSettings } from "@/store/settingsSlice.js";
import { getPrimaryTabForPath } from "@/app/routes.js";
import { selectUserZip } from "@/store/userSlice.js";
import { useDayNight } from "@/hooks/useDayNight.js";

function shouldReduceEffects(perfMode) {
  const mode = String(perfMode || "auto").toLowerCase();
  if (mode === "on") return true;
  if (mode === "off") return false;
  if (typeof window === "undefined") return false;
  try {
    if (navigator?.connection?.saveData) return true;
    const mem = Number(navigator?.deviceMemory || 0);
    if (mem && mem <= 4) return true;
    const cores = Number(navigator?.hardwareConcurrency || 0);
    if (cores && cores <= 4) return true;
  } catch {
    // ignore
  }
  return false;
}

export default function PageShell({
  children,
  className = "",
  mainClassName = "px-4 py-10",
  containerClassName = "w-full max-w-5xl mx-auto",
  disableBackground = false,
  useSurface = true,
}) {
  const shell = React.useContext(AppShellContext);
  const location = useLocation();
  const withinShell = Boolean(shell?.withinAppShell);
  const primaryTab = getPrimaryTabForPath(location.pathname);
  const settings = useSelector(selectSettings);
  const zip = useSelector(selectUserZip);
  const perfReduced = shouldReduceEffects(settings?.perfMode);
  const showBackgroundPhotos = settings?.showBackgroundPhotos !== false;
  const showVignette = settings?.showSceneVignette !== false && !perfReduced;
  const showGrain =
    settings?.showSceneGrain !== false &&
    !perfReduced &&
    settings?.reduceTransparency !== true;

  const { style: dayNightStyle } = useDayNight({
    zip,
    enableImages: showBackgroundPhotos,
  });

  const bgClass = disableBackground ? "" : "text-zinc-100";
  const compactSurface = withinShell && !primaryTab;
  const surfaceClass = useSurface
    ? compactSurface
      ? "px-0 py-0 sm:neon-surface sm:p-6"
      : "px-0 py-0 sm:neon-surface sm:p-6"
    : "";
  const effectiveContainerClass = compactSurface
    ? `${containerClassName} max-w-4xl`
    : containerClassName;
  const effectiveMainClass = compactSurface
    ? "px-4 py-5 sm:px-4 sm:py-8"
    : mainClassName;

  return (
    <section
      className={`relative ${bgClass} ${className}`.trim()}
      style={disableBackground ? undefined : dayNightStyle}
    >
      {!disableBackground ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(16,185,129,0.08),transparent_34%),radial-gradient(circle_at_92%_96%,rgba(56,189,248,0.1),transparent_36%)]" />
          {showVignette ? (
            <div className="absolute inset-0 bg-black/35" />
          ) : null}
          {showGrain ? (
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.6),transparent_55%)]" />
          ) : null}
        </div>
      ) : null}
      <div className={`relative z-10 ${effectiveMainClass}`.trim()}>
        <div className={effectiveContainerClass}>
          {!withinShell ? (
            <div className="sr-only" aria-hidden="true">
              App shell disabled
            </div>
          ) : null}
          <div className={surfaceClass}>{children}</div>
        </div>
      </div>
    </section>
  );
}
