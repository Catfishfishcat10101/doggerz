// src/components/UI/Status.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import * as dogSlice from "../../redux/dogSlice"; // probe selectors safely

// Prefer slice selectors if exported; otherwise fall back to raw state.
const selectPos =
  dogSlice.selectPos || dogSlice.selectPosition || ((s) => s?.dog?.pos ?? s?.dog?.position ?? { x: 0, y: 0 });
const selectDirection =
  dogSlice.selectDirection || ((s) => s?.dog?.direction ?? "right");
const selectHappiness =
  dogSlice.selectHappiness || ((s) => Number(s?.dog?.happiness ?? s?.dog?.needs?.happiness ?? 50));
const selectMoving =
  dogSlice.selectMoving || ((s) => Boolean(s?.dog?.isWalking ?? s?.dog?.moving ?? false));
const selectSpeed =
  dogSlice.selectSpeed || ((s) => Number(s?.dog?.speed ?? 1));

/**
 * Status
 *
 * Props:
 *  - className?: string
 *  - compact?: boolean            // reduced density
 *  - variant?: "card" | "pill"    // layout style
 *  - showTime?: boolean           // show local time right-aligned
 */
export default function Status({
  className = "",
  compact = false,
  variant = "card",
  showTime = true,
}) {
  const pos = useSelector(selectPos);
  const dir = useSelector(selectDirection);
  const happiness = clamp(useSelector(selectHappiness), 0, 100);
  const moving = useSelector(selectMoving);
  const speed = useSelector(selectSpeed);

  const xy = useMemo(
    () => `${num(pos?.x)} , ${num(pos?.y)}`,
    [pos?.x, pos?.y]
  );

  const facing = (dir || "right").toString();
  const mood = moodLabel(happiness);
  const moodColor = moodColorClass(happiness);

  const now = showTime ? new Date().toLocaleTimeString() : null;

  if (variant === "pill") {
    return (
      <div
        className={[
          "mx-auto w-full max-w-3xl mt-3",
          className,
        ].join(" ")}
      >
        <div
          className={[
            "flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur rounded-full border px-3 py-1.5 text-xs text-emerald-900",
            compact ? "px-2 py-1" : "",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <Pill label="Pos" value={xy} />
          <Pill label="Facing" value={capitalize(facing)} />
          <Pill label="State" value={moving ? `Walking ×${speed}` : "Idle"} />
          <Pill label="Mood" value={`${Math.round(happiness)}%`} color={moodColor} title={mood} />
          {now && <Pill label="Time" value={now} />}
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div
      className={[
        "w-full max-w-3xl mx-auto mt-3 bg-white rounded-2xl shadow p-4 text-sm text-emerald-900 border",
        compact ? "p-3 text-[13px]" : "",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Row label="Position">
          <code className="font-mono">{xy}</code>
        </Row>

        <Row label="Facing">
          <span className="capitalize">{facing}</span>
        </Row>

        <Row label="Happiness">
          <span className="font-medium">
            {Math.round(happiness)}%
          </span>
          <span
            className={[
              "ml-2 px-1.5 py-0.5 rounded text-[11px] border",
              badgeTone(moodColor),
            ].join(" ")}
            title={mood}
            aria-label={`Mood: ${mood}`}
          >
            {mood}
          </span>
        </Row>

        <Row label="Movement">
          <span className="font-medium">{moving ? "Walking" : "Idle"}</span>
          {moving && <span className="ml-2 text-emerald-900/70">×{speed}</span>}
        </Row>

        {now && (
          <Row label="Local time">
            <span>{now}</span>
          </Row>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI atoms ---------------- */

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-emerald-900/70">{label}</div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function Pill({ label, value, color, title }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-slate-800 bg-white",
        badgeTone(color),
      ].join(" ")}
      title={title || `${label}: ${value}`}
      aria-label={`${label}: ${value}`}
    >
      <span className="text-[11px] opacity-70">{label}</span>
      <span className="font-mono text-[11px]">{value}</span>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

function moodLabel(h) {
  if (h >= 80) return "Happy";
  if (h >= 60) return "Content";
  if (h >= 40) return "Worried";
  return "Needs Care";
}

function moodColorClass(h) {
  if (h >= 80) return "green";
  if (h >= 60) return "emerald";
  if (h >= 40) return "amber";
  return "rose";
}

function badgeTone(color) {
  switch (color) {
    case "green":
    case "emerald":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";
    case "amber":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "rose":
      return "border-rose-300 bg-rose-50 text-rose-800";
    default:
      return "border-slate-300 bg-white text-slate-800";
  }
}
