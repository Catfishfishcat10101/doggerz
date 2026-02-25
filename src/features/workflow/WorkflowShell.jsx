/** @format */

// src/features/workflow/WorkflowShell.jsx

import PageShell from "@/components/PageShell.jsx";

function StepPill({ label, active, done }) {
  const cls = active
    ? "border-emerald-300/70 bg-emerald-400/20 text-emerald-100"
    : done
      ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"
      : "border-white/10 bg-black/20 text-zinc-400";
  return (
    <div
      className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${cls}`}
    >
      {label}
    </div>
  );
}

export default function WorkflowShell({
  title = "",
  subtitle = "",
  steps = [],
  stepIndex = 0,
  canGoBack = false,
  onBack,
  onCancel,
  onPrimary,
  primaryLabel = "Continue",
  primaryDisabled = false,
  secondaryLabel = null,
  onSecondary,
  headerSlot = null,
  footerNote = "",
  children,
}) {
  const total = Array.isArray(steps) ? steps.length : 0;
  const safeIndex = Math.max(0, Math.min(Number(stepIndex || 0), total - 1));

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-5 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-zinc-300">{subtitle}</p>
              ) : null}
            </div>
            {headerSlot}
          </div>

          {total > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {steps.map((step, idx) => (
                <StepPill
                  key={`${step}-${idx}`}
                  label={String(step || `Step ${idx + 1}`)}
                  active={idx === safeIndex}
                  done={idx < safeIndex}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            {children}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-black/35"
              >
                Cancel
              </button>
              {secondaryLabel ? (
                <button
                  type="button"
                  onClick={onSecondary}
                  className="rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-black/35"
                >
                  {secondaryLabel}
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                disabled={!canGoBack}
                className="rounded-xl border border-white/15 bg-black/25 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-black/35 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onPrimary}
                disabled={!!primaryDisabled}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-extrabold text-black hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {primaryLabel}
              </button>
            </div>
          </div>

          {footerNote ? (
            <div className="mt-3 text-xs text-zinc-500">{footerNote}</div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
