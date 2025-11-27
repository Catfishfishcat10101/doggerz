// src/pages/Potty.jsx
// Doggerz: Potty training status page. Usage: <Potty /> shows progress and tips.
// Accessibility: ARIA roles and meta tags are documented for SEO and screen readers.
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectDog } from "@/features/game/redux/dogSlice.js";
import PageContainer from "@/features/game/components/PageContainer.jsx";

function describePottyTraining(training) {
  const t = Math.round(Number(training ?? 0));
  if (t >= 100) return "Fully potty trained. Indoor accidents are very rare.";
  if (t >= 75)
    return "Mostly trained with occasional accidents on stressful days.";
  if (t >= 50)
    return "Getting the hang of it. Keep taking them out after meals and naps.";
  if (t > 0)
    return "Just starting out. Short, frequent potty breaks work best.";
  return "Not potty trained yet. Expect frequent accidents until a routine forms.";
}

/**
 * Potty: Potty training status and tips page for Doggerz.
 * - Shows progress, accidents, last success, and training tips
 * - ARIA roles and meta tags for accessibility
 * - Defensive: Handles missing dog state
 */
export default function Potty() {
  const navigate = useNavigate();
  const dog = useSelector(selectDog);

  if (!dog) {
    return (
      <PageContainer
        title="No pup yet"
        subtitle="Adopt a Doggerz pup before you can track potty training."
      >
        <div className="space-y-4 max-w-lg">
          <p className="text-sm text-zinc-300">
            You need a Doggerz pup before you can potty train them.
          </p>
          <button
            type="button"
            onClick={() => navigate("/adopt")}
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-5 py-2.5 transition"
          >
            Adopt your pup
          </button>
        </div>
      </PageContainer>
    );
  }

  const potty = dog.potty || {};
  const training = Math.round(Number(potty.training ?? 0));
  const accidents = potty.totalAccidents ?? potty.accidents ?? 0;
  const lastSuccessAt = potty.lastSuccessAt
    ? new Date(potty.lastSuccessAt)
    : null;
  const lastAccidentAt = potty.lastAccidentAt
    ? new Date(potty.lastAccidentAt)
    : null;
  const summaryText = describePottyTraining(training);

  return (
    <PageContainer
      title={`Potty plan for ${dog.name || "your pup"}`}
      subtitle="Doggerz tracks potty progress when you take them out at optimal times."
      metaDescription="Doggerz potty training status: progress, accidents, and last successful outdoor trips for your virtual pup."
      padding="px-4 py-6"
      className="text-zinc-50"
    >
      <section
        className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-4 shadow-lg shadow-black/40"
        aria-labelledby="potty-status-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p
              id="potty-status-heading"
              className="text-xs font-semibold text-zinc-100"
            >
              Current training level
            </p>
            <p className="text-sm text-zinc-300">{training}% potty trained</p>
          </div>
          <div
            className="w-full sm:w-64 h-2 rounded-full bg-zinc-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={training}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Potty training progress"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${Math.max(0, Math.min(100, training))}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-zinc-200">{summaryText}</p>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          aria-label="Potty training stats"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
            <p className="text-[11px] font-semibold text-zinc-200">
              Total accidents
            </p>
            <p
              className="text-lg font-semibold text-rose-300"
              aria-live="polite"
            >
              {accidents}
            </p>
            <p className="text-[11px] text-zinc-200">
              Each indoor accident slows training a bit.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
            <p className="text-[11px] font-semibold text-zinc-200">
              Last successful potty
            </p>
            <p className="text-xs text-zinc-300">
              {lastSuccessAt
                ? lastSuccessAt.toLocaleString()
                : "No logged potty trips yet."}
            </p>
            <p className="text-[11px] text-zinc-200">
              Regular outdoor potty trips speed training.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
            <p className="text-[11px] font-semibold text-zinc-200">
              Last accident
            </p>
            <p className="text-xs text-zinc-300">
              {lastAccidentAt
                ? lastAccidentAt.toLocaleString()
                : "No accidents recorded yet."}
            </p>
            <p className="text-[11px] text-zinc-200">
              Consistent schedule & quick cleanups prevent repeats.
            </p>
          </div>
        </div>
      </section>
      <section
        className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3"
        aria-label="Training routine tips"
      >
        <p className="text-xs font-semibold text-zinc-100">
          Training routine tips
        </p>
        <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
          <li>
            Take your pup out <span className="font-semibold">right after</span>{" "}
            feeding, play, and naps.
          </li>
          <li>
            Use the Potty Walk button on the main screen when they successfully
            go outside.
          </li>
          <li>Keep a consistent schedule; irregular times slow learning.</li>
          <li>Never punish accidents; clean up & give more chances outside.</li>
        </ul>
      </section>
      <button
        type="button"
        onClick={() => navigate("/game")}
        className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
      >
        ← Back to your yard
      </button>
    </PageContainer>
  );
}
