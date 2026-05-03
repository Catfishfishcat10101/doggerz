// src/components/ui/EmptySlate.jsx
// src/components/EmptySlate.jsx

import { Link } from "react-router-dom";

export default function EmptySlate({
  kicker,
  title,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  onPrimary,
  onSecondary,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
      {kicker ? (
        <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">
          {kicker}
        </div>
      ) : null}
      {title ? (
        <div className="mt-2 text-xl font-extrabold text-zinc-100">{title}</div>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {primaryLabel ? (
          primaryTo ? (
            <Link
              to={primaryTo}
              className="rounded-2xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-100"
            >
              {primaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onPrimary}
              className="rounded-2xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-100"
            >
              {primaryLabel}
            </button>
          )
        ) : null}
        {secondaryLabel ? (
          secondaryTo ? (
            <Link
              to={secondaryTo}
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-zinc-100"
            >
              {secondaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-zinc-100"
            >
              {secondaryLabel}
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
