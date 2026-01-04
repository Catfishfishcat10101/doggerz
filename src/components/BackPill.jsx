// src/components/BackPill.jsx

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Visually consistent "Back" control.
 * - If `to` is provided, renders a <Link>.
 * - Otherwise goes back in history, with a safe fallback.
 */
export default function BackPill({
  to,
  fallbackTo = "/",
  label = "Back",
  className = "",
  replace = true,
}) {
  const navigate = useNavigate();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40";

  const text = (
    <>
      <span aria-hidden>←</span>
      <span>{label}</span>
    </>
  );

  const handleBack = React.useCallback(() => {
    try {
      navigate(-1);
    } catch {
      navigate(fallbackTo, { replace });
    }
  }, [fallbackTo, navigate, replace]);

  if (to) {
    return (
      <Link to={to} className={`${base} ${className}`.trim()}>
        {text}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`${base} ${className}`.trim()}
    >
      {text}
    </button>
  );
}
