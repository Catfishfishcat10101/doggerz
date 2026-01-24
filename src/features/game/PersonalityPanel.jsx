import { useSelector } from "react-redux";

import { selectDogPersonality } from "@/redux/dogSlice.js";

import PersonalityTraitCard from "@/features/personality/PersonalityTraitCard.jsx";

const TRAITS = [
  {
    key: "adventurous",
    title: "Adventurous ↔ Cautious",
    leftLabel: "Cautious",
    rightLabel: "Adventurous",
  },
  {
    key: "social",
    title: "Social ↔ Independent",
    leftLabel: "Independent",
    rightLabel: "Social",
  },
  {
    key: "energetic",
    title: "Energetic ↔ Calm",
    leftLabel: "Calm",
    rightLabel: "Energetic",
  },
  {
    key: "playful",
    title: "Playful ↔ Serious",
    leftLabel: "Serious",
    rightLabel: "Playful",
  },
  {
    key: "affectionate",
    title: "Affectionate ↔ Reserved",
    leftLabel: "Reserved",
    rightLabel: "Affectionate",
  },
];

export default function PersonalityPanel() {
  const personality = useSelector(selectDogPersonality);

  const traits = personality?.traits || {};

  const hint = String(personality?.animationHint || "").trim();

  return (
    <section className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            Dog personality
          </div>
          <div className="mt-0.5 text-sm font-extrabold text-emerald-200">
            Traits
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Hint
          </div>
          <div className="text-xs font-semibold text-zinc-200">
            {hint || "—"}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-zinc-400">
        Traits drift gradually based on what you do (play, rest, training—and
        even long breaks). In the future, these can drive unique animations.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {TRAITS.map((t) => (
          <PersonalityTraitCard
            key={t.key}
            traitKey={t.key}
            title={t.title}
            leftLabel={t.leftLabel}
            rightLabel={t.rightLabel}
            value={Number(traits?.[t.key] || 0)}
          />
        ))}
      </div>
    </section>
  );
}
