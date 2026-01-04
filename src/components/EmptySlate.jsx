// src/components/EmptySlate.jsx

import { Link } from "react-router-dom";

import BackPill from "@/components/BackPill.jsx";

/**
 * A single-decision empty state.
 * - One primary action (button or link)
 * - Optional subtle back affordance
 */
export default function EmptySlate({
  kicker,
  title,
  description,
  primaryLabel,
  primaryTo,
  onPrimary,
  backTo,
  backLabel = "Back",
  className = "",
}) {
  const shell =
    "rounded-3xl border border-white/12 bg-black/20 p-6 backdrop-blur shadow-[0_0_70px_rgba(0,0,0,0.35)]";

  const primaryBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold bg-emerald-400 text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] hover:bg-emerald-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50";

  const renderPrimary = () => {
    if (!primaryLabel) return null;

    if (primaryTo) {
      return (
        <Link to={primaryTo} className={primaryBase}>
          {primaryLabel}
        </Link>
      );
    }

    return (
      <button type="button" onClick={onPrimary} className={primaryBase}>
        {primaryLabel}
      </button>
    );
  };

  return (
    <section className={`${shell} ${className}`.trim()}>
      {kicker ? (
        <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
          {kicker}
        </div>
      ) : null}

      {title ? (
        <h2 className="mt-2 text-xl font-extrabold text-emerald-200">
          {title}
        </h2>
      ) : null}

      {description ? (
        <p className="mt-2 text-sm text-zinc-300 max-w-prose">{description}</p>
      ) : null}

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
        {renderPrimary()}

        {backTo ? (
          <BackPill
            to={backTo}
            label={backLabel}
            className="bg-black/30 hover:bg-black/40"
          />
        ) : null}
      </div>
    </section>
  );
}
