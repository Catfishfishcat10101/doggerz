// src/components/layout/PageSections.jsx
import { Link, useNavigate } from "react-router-dom";

import { PATHS } from "@/app/routes.js";

function HeaderIcon({ kind = "back" }) {
  if (kind === "menu") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M5 7h14M5 12h14M5 17h14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PageHeader({
  children,
  className = "",
  unstyled = false,
  ...props
}) {
  const base = unstyled
    ? ""
    : "space-y-3 rounded-2xl border border-emerald-400/20 bg-black/25 px-4 py-4 shadow-[0_10px_24px_rgba(2,6,23,0.35)]";
  return (
    <header className={`${base} ${className}`.trim()} {...props}>
      {children}
    </header>
  );
}

export function SubpageHeader({
  title,
  label = "Doggerz",
  backTo,
  menuTo = PATHS.MENU,
  className = "",
  children,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(PATHS.MENU);
  };

  return (
    <header
      className={`rounded-2xl border border-white/10 bg-zinc-950/82 px-3 py-3 shadow-[0_18px_44px_rgba(2,6,23,0.34)] backdrop-blur-xl sm:px-4 ${className}`.trim()}
    >
      <div className="flex min-h-12 items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-zinc-100 transition active:scale-[0.98]"
          aria-label="Go back"
        >
          <HeaderIcon />
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300/85">
            {label}
          </div>
          <h1 className="truncate text-lg font-black tracking-tight text-zinc-100 sm:text-xl">
            {title}
          </h1>
        </div>

        <Link
          to={menuTo}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition active:scale-[0.98]"
        >
          <HeaderIcon kind="menu" />
          <span className="hidden sm:inline">Menu</span>
        </Link>
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </header>
  );
}

export function PageFooter({
  children,
  className = "",
  unstyled = false,
  ...props
}) {
  const base = unstyled
    ? ""
    : "mt-8 border-t border-emerald-400/20 pt-4 text-sm text-zinc-300";
  return (
    <footer className={`${base} ${className}`.trim()} {...props}>
      {children}
    </footer>
  );
}
