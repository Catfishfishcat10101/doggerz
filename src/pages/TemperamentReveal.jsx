// src/pages/TemperamentReveal.jsx
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import PageShell from "@/components/PageShell.jsx";

export default function TemperamentReveal() {
  const dog = useSelector(selectDog);
  const temperament = dog?.temperament || {};
  const primary = temperament.primary || "Unknown";
  const secondary = temperament.secondary || null;
  const traits = temperament.traits || [];

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Temperament Reveal
          </h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Based on how you&apos;ve been treating your pup so far, this is
            their emerging personality profile.
          </p>
        </header>

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
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{secondary}</p>
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
              Temperament can shift slowly over time as your care patterns
              change. Check back after big routine changes to see how your pup
              evolves.
            </p>
          </section>
        )}
      </div>
    </PageShell>
  );
}
