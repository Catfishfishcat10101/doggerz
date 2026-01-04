import * as React from "react";

function clamp01(n) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function strengthLabel(absValue) {
  if (absValue >= 80) return "Strong";
  if (absValue >= 55) return "Clear";
  if (absValue >= 30) return "Slight";
  return "Balanced";
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
  const impacts = React.useMemo(
    () => getImpactCopy(String(traitKey || ""), Number(value || 0)),
    [traitKey, value]
  );

  const magnitude = clamp01(Math.abs(Number(value || 0)) / 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold text-zinc-200">
          {impacts.title}
        </div>
        <div className="text-[10px] text-zinc-500">Intensity</div>
      </div>

      <div
        className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-emerald-400/70"
          style={{ width: `${Math.round(magnitude * 100)}%` }}
        />
      </div>

      <ul className="mt-2 space-y-1">
        {impacts.bullets.map((b) => (
          <li key={b} className="text-[11px] text-zinc-300">
            • {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
