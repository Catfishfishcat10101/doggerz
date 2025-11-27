// src/pages/TemperamentReveal.jsx
// Doggerz: Temperament profile page. Usage: <TemperamentReveal /> shows current pup's traits.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/features/game/redux/dogSlice.js";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * Clamp helper for trait intensity (0–100).
 * @param {number} v
 * @returns {number}
 */
function clampIntensity(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}

/**
 * TemperamentReveal: Displays the temperament profile for the current pup in Doggerz.
 * - Shows primary, secondary, and trait breakdown
 * - ARIA roles and meta tags for accessibility
 * - Defensive: Handles missing dog state and initializing traits
 */
export default function TemperamentReveal() {
  const dog = useSelector(selectDog);
  const temperament = dog?.temperament || {};
  const primary = temperament.primary || "Unknown";
  const secondary = temperament.secondary || null;
  const traits = Array.isArray(temperament.traits) ? temperament.traits : [];
  const hasTraits = traits.length > 0;

  const pageTitle = "Temperament Reveal";
  const metaDescription =
    "Doggerz temperament profile: primary & secondary traits plus detailed trait breakdown.";

  return (
    <PageContainer
      title={pageTitle}
      subtitle="Emerging personality shaped by recent care patterns and mood samples."
      metaDescription={metaDescription}
      padding="px-4 py-10"
    >
      {!dog && (
        <p className="text-sm text-zinc-300" role="status">
          No pup loaded. Head back to the game or adopt first.
        </p>
      )}

      {dog && (
        <section
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 text-sm text-zinc-200"
          aria-labelledby="temperament-heading"
        >
          <h2
            id="temperament-heading"
            className="text-xs uppercase tracking-[0.25em] text-emerald-400"
          >
            {dog.name || "Your pup"}
          </h2>

          <div>
            <h3 className="text-xs text-zinc-300">Primary temperament</h3>
            <p className="text-lg font-semibold text-emerald-300">{primary}</p>
          </div>

          {secondary && (
            <div>
              <h3 className="text-xs text-zinc-300">Secondary flavor</h3>
              <p className="text-sm font-medium text-zinc-100">{secondary}</p>
            </div>
          )}

          {hasTraits && (
            <div>
              <p className="text-xs text-zinc-300 mb-1">Trait breakdown</p>
              <ul className="list-disc list-inside text-xs text-zinc-100 space-y-1">
                {traits.map((t, idx) => {
                  const label = t.label || t.id || String(t);
                  const hasIntensity =
                    typeof t.intensity === "number" &&
                    Number.isFinite(t.intensity);
                  return (
                    <li key={t.id ?? `${label}-${idx}`}>
                      <span className="font-medium">{label}</span>
                      {hasIntensity && (
                        <span className="ml-1 text-zinc-300">
                          ({clampIntensity(t.intensity)}%)
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!hasTraits && (
            <p className="text-xs text-zinc-300" role="note">
              Traits are still initializing. Revisit after more play and care.
            </p>
          )}

          <p className="text-xs text-zinc-300">
            Temperament shifts slowly as routines evolve. Check back after big
            changes in your pup&apos;s schedule or training.
          </p>
        </section>
      )}
    </PageContainer>
  );
}
