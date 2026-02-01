import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSettings,
  setTraitImpactCompact,
  setTraitImpactShowHighlights,
  setTraitImpactShowMeter,
  setTraitImpactShowTips,
} from "@/redux/settingsSlice.js";

function clamp01(n) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function strengthLabel(absValue) {
  if (absValue >= 80) return "Strong";
  if (absValue >= 55) return "Clear";
  if (absValue >= 30) return "Slight";
  return "Balanced";
}

function getTraitSides(traitKey) {
  switch (traitKey) {
    case "adventurous":
      return { left: "Cautious", right: "Adventurous" };
    case "social":
      return { left: "Independent", right: "Social" };
    case "energetic":
      return { left: "Calm", right: "Energetic" };
    case "playful":
      return { left: "Serious", right: "Playful" };
    case "affectionate":
      return { left: "Reserved", right: "Affectionate" };
    default:
      return { left: "Left", right: "Right" };
  }
}

function getTraitHighlights(traitKey, side) {
  if (side === "balanced") {
    return ["Flexible", "Steady", "Even temperament"];
  }
  const right = side === "right";
  switch (traitKey) {
    case "adventurous":
      return right
        ? ["Exploration", "Variety", "Spontaneous"]
        : ["Routine", "Safety", "Calm"];
    case "social":
      return right
        ? ["Together-time", "Attention", "Bond"]
        : ["Solo time", "Self-soothing", "Focus"];
    case "energetic":
      return right
        ? ["Stamina", "Play bursts", "High tempo"]
        : ["Recovery", "Low-key", "Steady pace"];
    case "playful":
      return right
        ? ["Fun", "Games", "Spontaneous"]
        : ["Structure", "Training", "Focus"];
    case "affectionate":
      return right
        ? ["Closeness", "Cuddles", "Warmth"]
        : ["Boundaries", "Trust", "Slow warmup"];
    default:
      return right ? ["Positive lean"] : ["Negative lean"];
  }
}

function getImpactCopy(traitKey, value) {
  const v = Number(value || 0);
  const abs = Math.abs(v);
  const strength = strengthLabel(abs);

  const side = v >= 0 ? "right" : "left";

  // Impacts are intentionally “soft”: they explain tendencies and lightly reference
  // current mechanics (play/rest/training/feed/bathe) without hard promises.
  switch (traitKey) {
    case "adventurous": {
      if (side === "right") {
        return {
          title: `${strength} Adventurous lean`,
          bullets: [
            "Enjoys play sessions that feel exploratory (new routines, varied activities).",
            "Usually gets a little more happiness from Play.",
            "Can get bored if days feel too same-y.",
          ],
        };
      }
      return {
        title: `${strength} Cautious lean`,
        bullets: [
          "Prefers predictable routines and calmer days.",
          "Tends to settle faster during Rest.",
          "May be slower to warm up to intense play streaks.",
        ],
      };
    }

    case "social": {
      if (side === "right") {
        return {
          title: `${strength} Social lean`,
          bullets: [
            "Likes together-time and attention.",
            "Typically gets a small extra mood lift from Feed/Play.",
            "Can feel extra sad after long breaks.",
          ],
        };
      }
      return {
        title: `${strength} Independent lean`,
        bullets: [
          "Comfortable doing their own thing.",
          "Less affected by short quiet stretches.",
          "May prefer training-focused sessions over constant attention.",
        ],
      };
    }

    case "energetic": {
      if (side === "right") {
        return {
          title: `${strength} Energetic lean`,
          bullets: [
            "Bounces back quickly and can play longer.",
            "Often spends a bit less energy per Play action.",
            "May want multiple play bursts per day.",
          ],
        };
      }
      return {
        title: `${strength} Calm lean`,
        bullets: [
          "Recovers more energy from Rest.",
          "More likely to enjoy low-key routines.",
          "Often tolerates grooming/bathing a bit better.",
        ],
      };
    }

    case "playful": {
      if (side === "right") {
        return {
          title: `${strength} Playful lean`,
          bullets: [
            "Lives for games and fun interactions.",
            "Gets a stronger happiness boost from Play.",
            "Training still works—just keep it snappy.",
          ],
        };
      }
      return {
        title: `${strength} Serious lean`,
        bullets: [
          "Enjoys structure and focused sessions.",
          "Tends to respond well to Training routines.",
          "May prefer fewer, higher-quality play sessions.",
        ],
      };
    }

    case "affectionate": {
      if (side === "right") {
        return {
          title: `${strength} Affectionate lean`,
          bullets: [
            "Seeks closeness and positive attention.",
            "Often gets a small extra mood boost from Feed.",
            "Might show ‘cuddle’ vibes in future animations.",
          ],
        };
      }
      return {
        title: `${strength} Reserved lean`,
        bullets: [
          "Shows affection more quietly and on their own terms.",
          "May need more time to trust after long breaks.",
          "Often prefers gentle, predictable care.",
        ],
      };
    }

    default:
      return {
        title: "Trait impact",
        bullets: ["This trait influences how your pup reacts over time."],
      };
  }
}

export default function TraitImpactIndicator({ traitKey, value }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);

  const compact = Boolean(settings?.traitImpactCompact);
  const showMeter = settings?.traitImpactShowMeter !== false;
  const showTips = settings?.traitImpactShowTips !== false;
  const showHighlights = settings?.traitImpactShowHighlights !== false;

  const impacts = React.useMemo(
    () => getImpactCopy(String(traitKey || ""), Number(value || 0)),
    [traitKey, value]
  );

  const numericValue = Number(value || 0);
  const magnitude = clamp01(Math.abs(numericValue) / 100);
  const strength = strengthLabel(Math.abs(numericValue));
  const side =
    strength === "Balanced" ? "balanced" : numericValue >= 0 ? "right" : "left";
  const sides = getTraitSides(String(traitKey || ""));
  const directionLabel = side === "right" ? sides.right : sides.left;
  const summary =
    strength === "Balanced" ? "Balanced" : `${strength} ${directionLabel} lean`;
  const highlights = getTraitHighlights(String(traitKey || ""), side);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
      <div
        className={[
          "flex flex-wrap items-start justify-between gap-3",
          compact ? "px-3 pt-3" : "px-4 pt-4",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-zinc-200">
            {impacts.title}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">{summary}</div>
        </div>
        <div className="text-[10px] text-zinc-500">
          Intensity {Math.round(magnitude * 100)}%
        </div>
      </div>

      {showMeter ? (
        <div
          className={[
            "mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10",
            compact ? "mx-3" : "mx-4",
          ].join(" ")}
          aria-hidden
        >
          <div className="relative h-full">
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
            <div
              className={[
                "absolute top-0 h-full rounded-full",
                numericValue >= 0
                  ? "bg-gradient-to-r from-emerald-400/60 to-emerald-300/90"
                  : "bg-gradient-to-l from-sky-400/60 to-sky-300/90",
              ].join(" ")}
              style={
                numericValue >= 0
                  ? {
                      left: "50%",
                      width: `${Math.round(magnitude * 50)}%`,
                    }
                  : {
                      right: "50%",
                      width: `${Math.round(magnitude * 50)}%`,
                    }
              }
            />
          </div>
        </div>
      ) : null}

      {showHighlights ? (
        <div
          className={[
            "mt-2 flex flex-wrap gap-2",
            compact ? "px-3" : "px-4",
          ].join(" ")}
        >
          {highlights.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {showTips ? (
        <ul
          className={[
            "mt-2 space-y-1",
            compact ? "px-3 pb-3" : "px-4 pb-4",
          ].join(" ")}
        >
          {impacts.bullets.map((b) => (
            <li key={b} className="text-[11px] text-zinc-300">
              • {b}
            </li>
          ))}
        </ul>
      ) : (
        <div className={compact ? "px-3 pb-3" : "px-4 pb-4"} />
      )}

      <div
        className={[
          "flex flex-wrap items-center gap-2 border-t border-white/10",
          compact ? "px-3 py-2" : "px-4 py-3",
        ].join(" ")}
      >
        <ToggleChip
          label={compact ? "Roomy" : "Compact"}
          active={compact}
          onClick={() => dispatch(setTraitImpactCompact(!compact))}
        />
        <ToggleChip
          label={showMeter ? "Hide meter" : "Show meter"}
          active={showMeter}
          onClick={() => dispatch(setTraitImpactShowMeter(!showMeter))}
        />
        <ToggleChip
          label={showTips ? "Hide tips" : "Show tips"}
          active={showTips}
          onClick={() => dispatch(setTraitImpactShowTips(!showTips))}
        />
        <ToggleChip
          label={showHighlights ? "Hide highlights" : "Show highlights"}
          active={showHighlights}
          onClick={() =>
            dispatch(setTraitImpactShowHighlights(!showHighlights))
          }
        />
      </div>
    </div>
  );
}

function ToggleChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition",
        active
          ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
