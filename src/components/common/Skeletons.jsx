// src/components/common/Skeletons.jsx
import React from "react";

/**
 * Base shimmer skeleton.
 * - aria-hidden by default (screen readers shouldn't read placeholders)
 * - Accepts inline size/shape via className
 * - Uses Tailwind's animate-shimmer (we added it in tailwind.config.js).
 */
export function Skeleton({ className = "", as: As = "div", ...rest }) {
  const base =
    "relative overflow-hidden bg-slate-200/60 dark:bg-slate-800/60 " +
    "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r " +
    "before:from-transparent before:via-white/60 dark:before:via-white/10 before:to-transparent " +
    "before:animate-shimmer";
  return <As aria-hidden className={`${base} ${className}`} {...rest} />;
}

/* Inline text skeletons --------------------------------------------------- */

export function TextLine({ width = "100%", className = "" }) {
  return (
    <Skeleton
      className={`h-3 rounded-md ${className}`}
      style={{ width }}
    />
  );
}

export function TitleLine({ width = "60%", className = "" }) {
  return (
    <Skeleton
      className={`h-5 rounded-lg ${className}`}
      style={{ width }}
    />
  );
}

/* Panels / Blocks --------------------------------------------------------- */

export function StatsBarSkeleton() {
  return <Skeleton className="h-6 w-full rounded-full" />;
}

/**
 * Panel skeleton that looks like real content:
 * header + 3 lines + button bar
 */
export function PanelSkeleton({ className = "", minHeight = "12rem" }) {
  return (
    <div
      className={`card p-4 ${className}`}
      style={{ minHeight }}
      aria-busy="true"
      aria-live="polite"
    >
      <TitleLine width="40%" />
      <div className="mt-4 space-y-2">
        <TextLine width="95%" />
        <TextLine width="88%" />
        <TextLine width="70%" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Grid of card placeholders.
 * Example: <GridSkeleton cols={{ base: 1, sm: 2, lg: 3 }} count={6} />
 */
export function GridSkeleton({
  count = 6,
  cols = { base: 1, sm: 2, lg: 3 },
  className = "",
}) {
  const gridCls = [
    "grid gap-3",
    `grid-cols-${cols.base ?? 1}`,
    cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    cols.lg ? `lg:grid-cols-${cols.lg}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${gridCls} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4">
          <TitleLine width="50%" />
          <div className="mt-3 space-y-2">
            <TextLine width="92%" />
            <TextLine width="80%" />
            <TextLine width="65%" />
          </div>
          <Skeleton className="mt-4 h-10 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/* Avatars / Media --------------------------------------------------------- */

export function AvatarSkeleton({ size = 48, className = "" }) {
  return (
    <Skeleton
      className={`rou
nded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}