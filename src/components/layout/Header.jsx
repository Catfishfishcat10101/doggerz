// src/components/layout/Header.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectIsLoggedIn } from "@/store/userSlice.js";
import { getPrimaryTabForPath, getRouteMeta, PATHS } from "@/app/routes.js";

const HIDE_ON_PATHS = new Set([
  PATHS.HOME,
  PATHS.ADOPT,
  PATHS.LOGIN,
  PATHS.SIGNUP,
  PATHS.GAME,
  PATHS.CARE,
]);

function AppBarIcon({ kind = "menu" }) {
  if (kind === "back") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 5 8 12l7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  if (HIDE_ON_PATHS.has(pathname)) {
    return null;
  }

  const primaryTab = getPrimaryTabForPath(pathname);
  const routeMeta = getRouteMeta(pathname);
  const topLevelTab = primaryTab?.path === pathname ? primaryTab : null;

  const sectionTitle = routeMeta?.title || topLevelTab?.label || "Doggerz";
  const sectionSubtitle = topLevelTab?.label || "Back to the app";

  const backTarget = topLevelTab
    ? PATHS.MENU
    : isLoggedIn
      ? PATHS.GAME
      : PATHS.MENU;
  const menuTarget = isLoggedIn ? PATHS.MENU : PATHS.HOME;

  return (
    <header className="sticky top-0 z-[90] border-b border-white/8 bg-zinc-950/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] w-full max-w-5xl items-center gap-3 px-3 pb-2 pt-[max(env(safe-area-inset-top,0px),0.5rem)] sm:px-4">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              navigate(-1);
              return;
            }
            navigate(backTarget);
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-zinc-100 active:scale-[0.98]"
          aria-label="Go back"
        >
          <AppBarIcon kind="back" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300/80">
            {sectionSubtitle}
          </div>
          <div className="truncate text-lg font-black tracking-tight text-zinc-100">
            {sectionTitle}
          </div>
        </div>

        <Link
          to={menuTarget}
          className="inline-flex min-h-10 items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 active:scale-[0.98]"
        >
          Menu
        </Link>
      </div>
    </header>
  );
}
