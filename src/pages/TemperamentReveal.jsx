// src/pages/TemperamentReveal.jsx
import PageShell from "@/components/layout/PageShell.jsx";
import { PageHeader } from "@/components/layout/PageSections.jsx";
import { useDog } from "@/hooks/useDogState.js";

export default function TemperamentReveal() {
  const dog = useDog();
  const temperament = dog?.temperament || {};
  const primary = temperament.primary || "Unknown";
  const secondary = temperament.secondary || null;
  const archetype = temperament.archetype || null;
  const traits = temperament.traits || [];
  const archetypeCopy = {
    ATHLETE:
      "Play-heavy care created an Athlete: high drive, fast reactions, and a body that wants a job.",
    SHADOW:
      "Frequent check-ins shaped a Shadow: attentive, clingy, and strongly keyed to your presence.",
    INDEPENDENT:
      "Longer gaps in attention created an Independent streak: self-directed, observant, and less needy moment to moment.",
    MISCHIEVOUS:
      "A clever chaos goblin has emerged: curious, distractible, and highly capable of inventing the wrong activity on purpose.",
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <PageHeader>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            72-Hour Archetype Reveal
          </h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Based on your first three days together, this is the personality
            pattern your pup is settling into.
          </p>
        </PageHeader>

        {!dog && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            No pup loaded. Head back to the game or adopt a dog first.
          </p>
        )}

        {dog && (
          <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-4 text-sm text-zinc-700 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300 dark:shadow-black/40">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400">
              {dog.name || "Your pup"}
            </p>

            <div>
              <p className="text-xs text-zinc-400">Primary temperament</p>
              <p className="text-lg font-semibold text-emerald-300">
                {primary}
              </p>
            </div>

            {secondary && (
              <div>
                <p className="text-xs text-zinc-400">Secondary flavor</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                  {secondary}
                </p>
              </div>
            )}

            {archetype && (
              <div>
                <p className="text-xs text-zinc-400">Archetype</p>
                <p className="text-lg font-semibold text-amber-300">
                  {archetype}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {archetypeCopy[archetype] ||
                    "Your pup is still settling into a distinct personality lane."}
                </p>
              </div>
            )}

            {traits.length > 0 && (
              <div>
                <p className="text-xs text-zinc-400 mb-1">Trait breakdown</p>
                <ul className="list-disc list-inside text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                  {traits.map((t) => (
                    <li key={t.id || t.label || t}>{t.label || t.id || t}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-zinc-600 dark:text-zinc-500">
              Core temperament stays recognizable, but archetype signals can
              drift as your routine changes. A Jack Russell always remembers a
              pattern — especially the chaotic ones.
            </p>
          </section>
        )}
      </div>
    </PageShell>
  );
}
