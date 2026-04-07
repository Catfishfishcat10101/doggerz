// src/components/layout/Header.jsx
import * as React from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { useSelector } from "react-redux";

import { selectIsLoggedIn } from "@/store/userSlice.js";
import {
  getPrimaryTabForPath,
  getRouteMeta,
  PATHS,
  PRIMARY_TABS,
} from "@/app/routes.js";

const HIDE_ON_PATHS = new Set([
  PATHS.HOME,
  PATHS.ADOPT,
  PATHS.LOGIN,
  PATHS.SIGNUP,
  PATHS.GAME,
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
  const navigationType = useNavigationType();
  const pathname = location.pathname;
  const quickTabs = React.useMemo(() => {
    return PRIMARY_TABS.filter((item) => {
      if (item.path === PATHS.GAME) return isLoggedIn;
      return item.path !== pathname;
    }).slice(0, 2);
  }, [isLoggedIn, pathname]);

  if (HIDE_ON_PATHS.has(pathname)) {
    return null;
  }

  const primaryTab = getPrimaryTabForPath(pathname);
  const routeMeta = getRouteMeta(pathname);
  const topLevelTab = primaryTab?.path === pathname ? primaryTab : null;
  const isPrimaryRoute = Boolean(primaryTab);

  const sectionTitle = topLevelTab?.label || routeMeta?.title || "Doggerz";
  const sectionSubtitle = isPrimaryRoute
    ? topLevelTab?.path === PATHS.MENU
      ? "Utilities"
      : topLevelTab?.label === "Yard"
        ? "Your pup"
        : "Main section"
    : "Back to the app";

  const canGoBack =
    !isPrimaryRoute &&
    (navigationType !== "POP" ||
      (typeof window !== "undefined" && window.history.length > 1));

  const backTarget =
    topLevelTab?.path || (isLoggedIn ? PATHS.GAME : PATHS.MENU);

  return (
    <header className="sticky top-0 z-[90] border-b border-white/8 bg-zinc-950/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] w-full max-w-5xl items-center gap-3 px-3 pb-2 pt-[max(env(safe-area-inset-top,0px),0.5rem)] sm:px-4">
        <button
          type="button"
          onClick={() => {
            if (canGoBack) {
              navigate(-1);
              return;
            }
            navigate(backTarget);
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-zinc-100 active:scale-[0.98]"
          aria-label={canGoBack ? "Go back" : "Open main section"}
        >
          <AppBarIcon kind={canGoBack ? "back" : "menu"} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300/80">
            {sectionSubtitle}
          </div>
          <div className="truncate text-lg font-black tracking-tight text-zinc-100">
            {sectionTitle}
          </div>
        </div>

        {isPrimaryRoute ? (
          <div className="flex items-center gap-2">
            {quickTabs.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 active:scale-[0.98] sm:block"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : (
          <Link
            to={isLoggedIn ? PATHS.GAME : PATHS.MENU}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 active:scale-[0.98]"
          >
            {isLoggedIn ? "Yard" : "Menu"}
          </Link>
        )}
      </div>
    </header>
  );
}
