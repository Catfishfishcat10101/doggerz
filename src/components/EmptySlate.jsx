// src/components/EmptySlate.jsx

import { Link } from "react-router-dom";

export default function EmptySlate({
  kicker,
  title,
  description,
  primaryLabel,
  primaryTo,
  onPrimary,
  backTo,
  backLabel = "Back",
}) {
  const PrimaryTag = primaryTo ? Link : "button";
  const primaryProps = primaryTo
    ? { to: primaryTo }
    : { type: "button", onClick: onPrimary };

  return (
    <div className="rounded-3xl border border-white/12 bg-black/25 p-6 backdrop-blur">
      {kicker ? (
        <div className="text-[11px] uppercase tracking-[0.26em] text-zinc-400">
          {kicker}
        </div>
      ) : null}
      <div className="mt-2 text-lg font-extrabold text-emerald-200">
        {title || "Nothing here yet"}
      </div>
      {description ? (
        <div className="mt-2 text-sm text-zinc-300 max-w-prose">
          {description}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {primaryLabel ? (
          <PrimaryTag
            {...primaryProps}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-extrabold bg-emerald-400 text-black hover:bg-emerald-300 transition"
          >
            {primaryLabel}
          </PrimaryTag>
        ) : null}

        {backTo ? (
          <Link
            to={backTo}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-xs font-semibold border border-white/15 bg-black/30 text-zinc-100 hover:bg-black/45 transition"
          >
            {backLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
