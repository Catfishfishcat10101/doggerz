// src/features/workflow/WorkflowShell.jsx

function StepPill({ label, active, done }) {
  const base =
    "px-3 py-1 rounded-full text-xs font-semibold border transition whitespace-nowrap";
  const cls = done
    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
    : active
      ? "border-emerald-500/40 bg-black/25 text-emerald-100"
      : "border-white/10 bg-black/15 text-zinc-400";

  return <div className={`${base} ${cls}`}>{label}</div>;
}

export default function WorkflowShell({
  title,
  subtitle,
  steps,
  stepIndex,
  children,
  canGoBack,
  onBack,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onCancel,
  headerSlot = null,
  footerNote = null,
}) {
  const total = Array.isArray(steps) ? steps.length : 0;
  const safeStep = Number.isFinite(stepIndex) ? stepIndex : 0;

  return (
    <div className="relative flex flex-col items-center w-full h-full pt-8 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_45%)]" />

      <div className="relative z-10 flex flex-col items-center mb-6">
        <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-200/90">
          Onboarding
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-[0.3em] text-emerald-300 drop-shadow-lg">
          D O G G E R Z
        </h1>
        {subtitle ? (
          <p className="text-sm text-zinc-300 mt-2 text-center max-w-md">
            {subtitle}
          </p>
        ) : null}
        {headerSlot ? <div className="mt-3">{headerSlot}</div> : null}
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {total > 0 ? (
              <div className="mt-1 text-xs text-zinc-400">
                Step {Math.min(total, safeStep + 1)} of {total}
              </div>
            ) : null}
          </div>

          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-zinc-300 hover:text-white underline decoration-white/20 hover:decoration-white/40"
            >
              Cancel
            </button>
          ) : null}
        </div>

        {total > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {steps.map((s, idx) => (
              <StepPill
                key={`${String(s)}:${idx}`}
                label={s}
                active={idx === safeStep}
                done={idx < safeStep}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-5">{children}</div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onBack}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
              canGoBack
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-white/3 border-white/5 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Back
          </button>

          <button
            type="button"
            onClick={onPrimary}
            disabled={!!primaryDisabled}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition ${
              primaryDisabled
                ? "bg-emerald-900/30 text-emerald-200/60 border border-emerald-500/10 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {primaryLabel || "Continue"}
          </button>
        </div>

        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className="mt-3 w-full py-2.5 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-sm font-semibold transition"
          >
            {secondaryLabel}
          </button>
        ) : null}

        {footerNote ? (
          <p className="mt-4 text-[11px] text-zinc-500 text-center">
            {footerNote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
