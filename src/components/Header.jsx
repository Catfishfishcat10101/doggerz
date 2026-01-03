import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PRIMARY_NAV } from "@/routes.js";
import { prefetchDogAIEngine, prefetchGameRoute } from "@/utils/prefetch.js";
import { selectIsLoggedIn } from "@/redux/userSlice.js";

export default function Header() {
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleButtonRef = React.useRef(null);
  const mobilePanelRef = React.useRef(null);
  const firstMobileLinkRef = React.useRef(null);

  React.useEffect(() => {
    // Close the mobile menu on navigation.
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }

      // Basic focus trap for the mobile menu (keeps tab focus inside the panel)
      if (e.key === "Tab") {
        const panel = mobilePanelRef.current;
        if (!panel) return;

        const focusables = Array.from(
          panel.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => {
          // skip hidden elements
          return Boolean(el) && !el.hasAttribute("disabled") && el.tabIndex !== -1;
        });

        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  React.useEffect(() => {
    if (mobileOpen) {
      // Focus the first link when opening the menu for keyboard users.
      window.setTimeout(() => {
        firstMobileLinkRef.current?.focus?.();
      }, 0);
      return;
    }

    // Restore focus to the toggle button when the menu closes.
    toggleButtonRef.current?.focus?.();
  }, [mobileOpen]);

  const isPathActive = React.useCallback(
    (to) => {
      const pathname = location.pathname || "/";
      const target = String(to || "/");
      if (target === "/") return pathname === "/";
      return pathname === target || pathname.startsWith(`${target}/`);
    },
    [location.pathname]
  );

  const prefetchIfGame = React.useCallback((to) => {
    if (String(to) !== "/game") return;
    // Warm both the route and the background engine chunk.
    prefetchGameRoute().catch(() => { });
    prefetchDogAIEngine().catch(() => { });
  }, []);

  return (
    <header className="w-full border-b border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-4">
          <img
            src="/icons/doggerz-logo.svg"
            alt="Doggerz"
            className="h-12 w-12"
            loading="eager"
            decoding="async"
          />
          {/* Match Landing wordmark exactly */}
          <div className="inline-flex flex-col">
            <span className="text-3xl sm:text-5xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.55)]">
              DOGGERZ
            </span>
            <span className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
              Adopt. Train. Bond.
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            type="button"
            ref={toggleButtonRef}
            className="lg:hidden inline-flex items-center justify-center rounded-md border border-white/10 bg-black/25 px-2.5 py-2 text-zinc-200 hover:border-emerald-500/60 hover:text-emerald-200"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {mobileOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>

          <div className="hidden lg:flex items-center gap-4">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => prefetchIfGame(item.path)}
                onFocus={() => prefetchIfGame(item.path)}
                aria-current={isPathActive(item.path) ? "page" : undefined}
                className={
                  isPathActive(item.path)
                    ? "text-sm font-semibold text-emerald-200 underline underline-offset-8 decoration-emerald-400/70"
                    : "text-sm text-zinc-400 hover:text-emerald-200"
                }
              >
                {item.label}
              </Link>
            ))}
          </div>

          {!isLoggedIn ? (
            <Link
              to="/login"
              aria-current={isPathActive("/login") ? "page" : undefined}
              className={
                isPathActive("/login")
                  ? "text-sm rounded-md bg-emerald-500/20 border border-emerald-500/35 px-3 py-1 text-emerald-100"
                  : "text-sm rounded-md bg-black/25 border border-white/10 px-3 py-1 text-zinc-100 hover:bg-black/35"
              }
            >
              Login
            </Link>
          ) : null}
        </nav>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        ref={mobilePanelRef}
        className={
          mobileOpen
            ? "mx-auto mt-3 max-w-6xl lg:hidden"
            : "mx-auto mt-3 max-w-6xl lg:hidden hidden"
        }
      >
        <div className="rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-md">
          <div className="grid gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              ref={firstMobileLinkRef}
              aria-current={isPathActive("/") ? "page" : undefined}
              className={
                isPathActive("/")
                  ? "rounded-xl px-3 py-2 text-sm font-semibold text-emerald-200 bg-zinc-900/50"
                  : "rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-black/35 hover:text-emerald-200"
              }
            >
              Home
            </Link>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => prefetchIfGame(item.path)}
                onFocus={() => prefetchIfGame(item.path)}
                aria-current={isPathActive(item.path) ? "page" : undefined}
                className={
                  isPathActive(item.path)
                    ? "rounded-xl px-3 py-2 text-sm font-semibold text-emerald-200 bg-zinc-900/50"
                    : "rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-black/35 hover:text-emerald-200"
                }
              >
                {item.label}
              </Link>
            ))}

            {!isLoggedIn ? (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                aria-current={isPathActive("/login") ? "page" : undefined}
                className={
                  isPathActive("/login")
                    ? "rounded-xl px-3 py-2 text-sm font-semibold text-emerald-200 bg-zinc-900/50"
                    : "rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-black/35 hover:text-emerald-200"
                }
              >
                Login
              </Link>
            ) : null}
          </div>

          <p className="mt-2 px-3 text-xs text-zinc-500">
            Tip: press <span className="font-semibold">Esc</span> to close.
          </p>
        </div>
      </div>
    </header>
  );
}
