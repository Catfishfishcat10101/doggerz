// src/pages/Potty.jsx
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes.js";
import { selectDog } from "@/redux/dogSlice.js";
import PageShell from "@/components/PageShell.jsx";
import EmptySlate from "@/components/EmptySlate.jsx";

function describePottyTraining(training) {
  const t = Math.round(Number(training ?? 0));

  if (t >= 100) {
    return "Fully potty trained. Indoor accidents are very rare.";
  }
  if (t >= 75) {
    return "Mostly trained with occasional accidents on stressful days.";
  }
  if (t >= 50) {
    return "Getting the hang of it. Keep taking them out after meals and naps.";
  }
  if (t > 0) {
    return "Just starting out. Short, frequent potty breaks work best.";
  }
  return "Not potty trained yet. Expect frequent accidents until a routine forms.";
}

export default function Potty() {
  const navigate = useNavigate();
  const dog = useSelector(selectDog);

  // If there is no dog at all, send them to adopt
  if (!dog) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-lg">
          <EmptySlate
            kicker="Potty Training"
            title="No pup yet"
            description="You’ll need to adopt a Doggerz pup before you can start potty training."
            primaryLabel="Adopt your pup"
            onPrimary={() => navigate(PATHS.ADOPT)}
            backTo={PATHS.HOME}
            backLabel="Back to home"
          />
        </div>
      </PageShell>
    );
  }

  const potty = dog.potty || {};
  const training = Math.round(Number(potty.training ?? 0));
  const accidents = potty.accidents ?? 0;
  const lastSuccessAt = potty.lastSuccessAt
    ? new Date(potty.lastSuccessAt)
    : null;
  const lastAccidentAt = potty.lastAccidentAt
    ? new Date(potty.lastAccidentAt)
    : null;

  const summaryText = describePottyTraining(training);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Potty Training
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Potty plan for {dog.name || "your pup"}
          </h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-xl">
            Doggerz quietly tracks potty-training progress in the background
            every time you take your dog outside after eating, playing, or
            waking up.
          </p>
        </header>

        {/* Status card */}
        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 space-y-4 shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-black/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Current training level
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{training}% potty trained</p>
            </div>

            <div className="w-full sm:w-64 h-2 rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${Math.max(0, Math.min(100, training))}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">{summaryText}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                Total accidents
              </p>
              <p className="text-lg font-semibold text-rose-300">{accidents}</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                Each indoor accident slows training a bit.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                Last successful potty
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {lastSuccessAt
                  ? lastSuccessAt.toLocaleString()
                  : "No logged potty trips yet."}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                Logging regular outdoor potty trips speeds training.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white/70 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200">
                Last accident
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {lastAccidentAt
                  ? lastAccidentAt.toLocaleString()
                  : "No accidents recorded yet."}
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500">
                Consistent schedule and quick cleanups help prevent repeats.
              </p>
            </div>
          </div>
        </section>

        {/* Tips / guide section */}
        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Training routine tips
          </p>
          <ul className="list-disc list-inside text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
            <li>
              Take your pup out{" "}
              <span className="font-semibold">right after</span> feeding, play
              sessions, and naps.
            </li>
            <li>
              Use the <span className="font-semibold">Potty Walk</span> button
              on the main game screen when you successfully go outside.
            </li>
            <li>
              Try to keep a consistent schedule. Irregular times make
              potty-training slower and more confusing.
            </li>
            <li>
              Don&apos;t punish accidents; clean them up and give more chances
              to succeed outside.
            </li>
          </ul>
        </section>

        <button
          type="button"
          onClick={() => navigate(PATHS.GAME)}
          className="text-xs text-emerald-700 hover:text-emerald-600 underline underline-offset-4 dark:text-emerald-300 dark:hover:text-emerald-200"
        >
          ← Back to your yard
        </button>
      </div>
    </PageShell>
  );
}
