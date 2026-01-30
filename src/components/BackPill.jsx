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
  ariaLabel,
  title,
  className = "",
  replace = true,
  size = "md", // sm | md | lg
  tone = "dark", // dark | light | emerald
  showIcon = true,
  icon = "←",
  showLabel = true,
  confirmMessage = "",
  onClick,
}) {
  const navigate = useNavigate();

  const sizeClass =
    size === "sm"
      ? "px-2.5 py-1.5 text-[11px]"
      : size === "lg"
        ? "px-4 py-2.5 text-sm"
        : "px-3 py-2 text-xs";

  const toneClass =
    tone === "emerald"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
      : tone === "light"
        ? "border-black/10 bg-white/80 text-zinc-900 hover:bg-white"
        : "border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35";

  const base = [
    "inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold transition",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40",
    "shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
    sizeClass,
    toneClass,
  ].join(" ");

  const safeLabel = String(label || "Back");
  const accessibleLabel = ariaLabel || safeLabel;
  const buttonTitle = title || safeLabel;

  const text = (
    <>
      {showIcon ? <span aria-hidden>{icon}</span> : null}
      {showLabel ? <span>{safeLabel}</span> : null}
      {!showLabel ? <span className="sr-only">{safeLabel}</span> : null}
    </>
  );

  const handleBack = React.useCallback(() => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    try {
      if (typeof window !== "undefined" && window.history.length <= 1) {
        navigate(fallbackTo, { replace });
      } else {
        navigate(-1);
      }
    } catch {
      navigate(fallbackTo, { replace });
    }
  }, [confirmMessage, fallbackTo, navigate, replace]);

  const handleLinkClick = React.useCallback(
    (event) => {
      if (confirmMessage && !window.confirm(confirmMessage)) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [confirmMessage, onClick]
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={handleLinkClick}
        aria-label={accessibleLabel}
        title={buttonTitle}
        className={`${base} ${className}`.trim()}
      >
        {text}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={accessibleLabel}
      title={buttonTitle}
      className={`${base} ${className}`.trim()}
    >
      {text}
    </button>
  );
}
