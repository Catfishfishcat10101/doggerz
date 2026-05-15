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
  backLabel,
  backTo,
  onPrimary,
  onSecondary,
}) {
  const buttonBase =
    "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition active:scale-[0.98]";

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,32,0.92),rgba(3,8,16,0.94))] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {kicker ? (
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300/80">
          {kicker}
        </div>
      ) : null}
      {title ? (
        <div className="mt-2 text-2xl font-black leading-tight text-zinc-100">
          {title}
        </div>
      ) : null}
      {description ? (
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          {description}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        {primaryLabel ? (
          primaryTo ? (
            <Link
              to={primaryTo}
              className={`${buttonBase} border border-emerald-300/30 bg-emerald-400 text-black shadow-[0_12px_30px_rgba(52,211,153,0.18)]`}
            >
              {primaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onPrimary}
              className={`${buttonBase} border border-emerald-300/30 bg-emerald-400 text-black shadow-[0_12px_30px_rgba(52,211,153,0.18)]`}
            >
              {primaryLabel}
            </button>
          )
        ) : null}
        {secondaryLabel ? (
          secondaryTo ? (
            <Link
              to={secondaryTo}
              className={`${buttonBase} border border-white/15 bg-white/8 text-zinc-100`}
            >
              {secondaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onSecondary}
              className={`${buttonBase} border border-white/15 bg-white/8 text-zinc-100`}
            >
              {secondaryLabel}
            </button>
          )
        ) : null}
      </div>

      {backLabel && backTo ? (
        <Link
          to={backTo}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:text-zinc-100"
        >
          {backLabel}
        </Link>
      ) : null}
    </div>
  );
}
