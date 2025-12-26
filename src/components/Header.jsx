import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { SOCIAL_LINKS } from "@/config/links.js";
import { PRIMARY_NAV } from "@/routes.js";

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    // Close the mobile menu on navigation.
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="w-full border-b border-zinc-800 bg-slate-950/60 px-4 py-3">
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
            <span className="text-5xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.55)]">
              DOGGERZ
            </span>
            <span className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-250">
              Adopt. Train. Bond.
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-zinc-200 hover:border-emerald-500/60 hover:text-emerald-200"
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
                className="text-sm text-zinc-400 hover:text-emerald-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            to="/login"
            className="text-sm rounded-md bg-zinc-900/60 px-3 py-1 text-zinc-100 hover:bg-zinc-900/80"
          >
            Login
          </Link>

          {/* Social buttons */}
          <div className="ml-2 flex items-center gap-2">
            {SOCIAL_LINKS.twitter && (
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Doggerz on X (Twitter)"
                className="rounded-md p-1 text-zinc-300 hover:text-emerald-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22 5.92c-.63.28-1.3.48-2 .57a3.46 3.46 0 0 0 1.52-1.92 6.9 6.9 0 0 1-2.2.84A3.44 3.44 0 0 0 12.1 8.3a9.76 9.76 0 0 1-7.08-3.59 3.44 3.44 0 0 0 1.06 4.59 3.4 3.4 0 0 1-1.56-.43v.04a3.44 3.44 0 0 0 2.75 3.37 3.5 3.5 0 0 1-.9.12 3.1 3.1 0 0 1-.65-.06 3.45 3.45 0 0 0 3.22 2.39A6.9 6.9 0 0 1 3 18.57 9.75 9.75 0 0 0 8.4 20c6.1 0 9.44-5.05 9.44-9.44v-.43A6.7 6.7 0 0 0 22 5.92z" />
                </svg>
              </a>
            )}

            {SOCIAL_LINKS.discord && (
              <a
                href={SOCIAL_LINKS.discord}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Doggerz on Discord"
                className="rounded-md p-1 text-zinc-300 hover:text-emerald-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.5 4.5A19.9 19.9 0 0 0 16 3a13.2 13.2 0 0 0-.7 1.6A17.8 17.8 0 0 0 9.6 5 13.3 13.3 0 0 0 6 3.9 18.2 18.2 0 0 0 2 4.5C1.3 6.1 1.2 7.7 1.5 9.3a17.8 17.8 0 0 0 3.6 7.1 13.6 13.6 0 0 0 4.1 3.1c.3-.4.6-.8.9-1.2a8.9 8.9 0 0 1-1.3-.5c.1 0 .3.1.4.1 3.6 1.6 8.1 1.1 11.2-1.6 0 0-1.1 0-2.6-1.1a11.3 11.3 0 0 0 2.2-2.8 17.7 17.7 0 0 0 2.7-7.8c.2-1.6.1-3.2-.7-4.8z" />
                </svg>
              </a>
            )}

            {SOCIAL_LINKS.github && (
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Doggerz on GitHub"
                className="rounded-md p-1 text-zinc-300 hover:text-emerald-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 .5A12 12 0 0 0 0 12.6c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.2.8-.5v-2c-3.3.7-4-1.6-4-1.6-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.8.7 2.2 1.2.1-.9.4-1.6.7-2-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.7.2 3 .1 3.3.7.9 1.2 2 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.3.8 1 .8 2v3c0 .3.2.6.8.5A12 12 0 0 0 24 12.6 12 12 0 0 0 12 .5z" />
                </svg>
              </a>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile nav panel */}
      <div
        id="mobile-nav"
        className={
          mobileOpen
            ? "mx-auto mt-3 max-w-6xl lg:hidden"
            : "mx-auto mt-3 max-w-6xl lg:hidden hidden"
        }
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 backdrop-blur">
          <div className="grid gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60 hover:text-emerald-200"
            >
              Home
            </Link>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60 hover:text-emerald-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="mt-2 px-3 text-xs text-zinc-500">
            Tip: press <span className="font-semibold">Esc</span> to close.
          </p>
        </div>
      </div>
    </header>
  );
}
