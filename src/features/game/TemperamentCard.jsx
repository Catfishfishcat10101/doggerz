// @ts-nocheck
// src/features/game/TemperamentCard.jsx
//
// Shows your dog's temperament summary and traits.
// Safe to render even if temperament isn't set yet.

import React from "react";

export default function TemperamentCard({
  temperament,      // e.g. "LOYAL", "ROWDY", etc.
  traits = [],      // array of { name, description } or strings
  rank,             // e.g. "S", "A", "B" etc.
  discoveredAt,     // ISO string or null
}) {
  const hasTemperament = Boolean(temperament);

  const title = hasTemperament
    ? formatTemperament(temperament)
    : "Temperament Unknown";

  const subtitle = hasTemperament
    ? "Your pup's emerging personality profile."
    : "Play, train, and care for your dog to reveal their temperament.";

  const parsedTraits = normalizeTraits(traits, temperament);

  return (
    <section className="w-full rounded-2xl border border-emerald-500/40 bg-black/60 p-4 backdrop-blur">
      <header className="flex items-center justify-between gap-3 mb-2">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Temperament
          </h2>
          <p className="text-lg font-bold text-slate-50 leading-tight">
            {title}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {rank && (
            <span className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-100">
              Rank: {rank}
            </span>
          )}
          {discoveredAt && (
            <span className="text-[10px] text-slate-300">
              Discovered: {formatDate(discoveredAt)}
            </span>
          )}
        </div>
      </header>

      <p className="text-xs text-slate-200 mb-3">{subtitle}</p>

      {hasTemperament && parsedTraits.length > 0 ? (
        <ul className="space-y-2" role="list">
          {parsedTraits.map((trait, idx) => (
            <li
              key={`${trait.name}-${idx}`}
              role="listitem"
              tabIndex={0}
              className="flex items-start gap-2 rounded-xl bg-slate-900/70 border border-slate-700/60 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <div className="mt-0.5 text-emerald-300 text-xs">◆</div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-50">
                  {trait.name}
                </div>
                {trait.description && (
                  <div className="text-[11px] text-slate-300">
                    {trait.description}
                  </div>
                )}
                {typeof trait.intensity === 'number' && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2"
                        style={{ width: `${Math.max(0, Math.min(100, trait.intensity))}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Intensity: {trait.intensity}%</div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

// --- helpers ---

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-600/80 bg-slate-950/70 px-3 py-3">
      <p className="text-[11px] text-slate-300 mb-1">
        Your pup is still figuring themselves out.
      </p>
      <p className="text-[11px] text-slate-400">
        Keep feeding, playing, and training. Once you&apos;ve spent enough time
        together, Doggerz will reveal your dog&apos;s temperament profile here.
      </p>
    </div>
  );
}

function formatTemperament(value) {
  if (!value) return "";
  const s = String(value).trim().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Normalize traits into [{ name, description }] objects
 */
function normalizeTraits(traits, temperament) {
  if (!Array.isArray(traits) || traits.length === 0) {
    // Provide a couple of default traits based on temperament if desired
    if (!temperament) return [];
    const tempLabel = formatTemperament(temperament);
    return [
      {
        name: "Core Trait",
        description: `${tempLabel} is your pup's primary temperament. This will influence how they react to care, play, and training.`,
      },
    ];
  }

  return traits.map((t) => {
    if (typeof t === "string") {
      return {
        name: t,
        description: "",
      };
    }
    if (t && typeof t === "object") {
      return {
        name: t.name || "Trait",
        description: t.description || "",
      };
    }
    return { name: "Trait", description: "" };
  });
}
