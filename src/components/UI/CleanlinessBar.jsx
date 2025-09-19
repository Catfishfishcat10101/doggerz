// src/components/UI/CleanlinessBar.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

/**
 * CleanlinessBar
 * - Derives a cleanliness score (0–100) from dog state with sane fallbacks.
 * - Shows status label + accessible progressbar.
 * - Visual affordances:
 *    • Stripes when fleas/mange present
 *    • Subtle shimmer when recently dirty
 *    • Color ramps: red → amber → yellow → green
 *
 * Props:
 *  - className?: string
 *  - width?: number | string      // default 256 (px). Accepts Tailwind width if you pass className instead.
 *  - compact?: boolean            // tighter padding/typography
 *  - showLabel?: boolean          // show textual status and percent (default true)
 *  - overrideScore?: number       // force a score (0–100), bypass computation
 */
export default function CleanlinessBar({
  className = "",
  width = 256,
  compact = false,
  showLabel = true,
  overrideScore,
}) {
  // Safe slice reads (won't blow up if s.dog is missing)
  const dog = useSelector((s) => s?.dog ?? {});
  const {
    isDirty = false,
    hasFleas = false,
    hasMange = false,
    dirtiness = null,        // optional numeric 0–100 where 100 = filthy
    parasiteSeverity = null, // optional numeric 0–100
    lastBathAt = null,       // optional timestamp
  } = dog;

  const { pct, status, colorClass, striped, shimmer } = useMemo(() => {
    // If caller forces a score, just style it.
    const score = normalizeScore(
      overrideScore ?? computeCleanliness({ isDirty, hasFleas, hasMange, dirtiness, parasiteSeverity })
    );

    const now = Date.now();
    const recently = typeof lastBathAt === "number" ? (now - lastBathAt) < 3 * 60 * 1000 : false; // 3 min
    const shimmer = isDirty || recently;

    // Map score to color + status
    let colorClass = "bg-rose-600";
    let status = "Critical";
    if (score >= 90) { colorClass = "bg-green-500"; status = "Sparkling"; }
    else if (score >= 75) { colorClass = "bg-green-400"; status = "Clean"; }
    else if (score >= 55) { colorClass = "bg-yellow-400"; status = "Grimy"; }
    else if (score >= 30) { colorClass = "bg-orange-500"; status = "Dirty"; }

    // Parasites = always stripe for visual urgency
    const striped = hasFleas || hasMange || (typeof parasiteSeverity === "number" && parasiteSeverity > 0);

    return { pct: score, status, colorClass, striped, shimmer };
  }, [isDirty, hasFleas, hasMange, dirtiness, parasiteSeverity, lastBathAt, overrideScore]);

  const containerStyle = typeof width === "number" ? { width: `${width}px` } : {};
  const ariaText = `${Math.round(pct)} percent – ${status}${hasMange ? ", mange detected" : hasFleas ? ", fleas detected" : ""}`;

  return (
    <div className={["inline-block", className].join(" ")} style={containerStyle}>
      {showLabel && (
        <div className={["flex items-baseline justify-between mb-1", compact ? "text-[11px]" : "text-xs"].join(" ")}>
          <span className="opacity-80" aria-live="polite">{status}</span>
          <span className="tabular-nums opacity-70">{Math.round(pct)}%</span>
        </div>
      )}

      <div
        className="w-full rounded h-3 overflow-hidden bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={ariaText}
        title={ariaText}
      >
        <div
          className={[
            "h-full transition-[width] duration-300 ease-out",
            colorClass,
            striped ? "cleanliness-stripes" : "",
            shimmer ? "cleanliness-shimmer" : "",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Legend (compact) */}
      {(hasFleas || hasMange) && (
        <div className={["mt-1 text-[10px] font-medium", compact ? "opacity-80" : "opacity-70"].join(" ")}>
          {hasMange ? "⚠️ Mange detected" : hasFleas ? "⚠️ Fleas detected" : null}
        </div>
      )}
    </div>
  );
}

/* =======================
   Scoring
   ======================= */

/**
 * Compute cleanliness score 0–100 where 100 = perfectly clean.
 * Priority: mange > fleas > general dirt.
 * If numeric fields available, use them; else map from booleans.
 */
function computeCleanliness({ isDirty, hasFleas, hasMange, dirtiness, parasiteSeverity }) {
  // Base from dirtiness number if provided (0 clean → 100 filthy)
  let base = typeof dirtiness === "number" ? (100 - clamp(dirtiness, 0, 100)) : (isDirty ? 60 : 100);

  // Parasites are heavy hitters
  if (typeof parasiteSeverity === "number") {
    // severity 0–100 knocks up to 60 pts
    base -= (clamp(parasiteSeverity, 0, 100) * 0.6);
  } else {
    if (hasFleas) base -= 35;
    if (hasMange) base -= 70;
  }

  return clamp(base, 0, 100);
}

/* =======================
   Styles (scoped CSS-in-JS via utility classes)
   Tailwind-safe: we add custom classes and define their CSS below.
   ======================= */

const styleTagId = "__cleanliness_bar_styles__";
if (typeof document !== "undefined" && !document.getElementById(styleTagId)) {
  const css = `
    .cleanliness-stripes {
      background-image: linear-gradient(
        45deg,
        rgba(255,255,255,0.35) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255,255,255,0.35) 50%,
        rgba(255,255,255,0.35) 75%,
        transparent 75%,
        transparent
      );
      background-size: 16px 16px;
    }
    .cleanliness-shimmer {
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }
    .cleanliness-shimmer::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
      transform: translateX(-100%);
      animation: cleanliness-shimmer 1.4s ease-in-out infinite;
      pointer-events: none;
      mix-blend-mode: screen;
    }
    @keyframes cleanliness-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  const tag = document.createElement("style");
  tag.id = styleTagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}

/* =======================
   Utils
   ======================= */
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
