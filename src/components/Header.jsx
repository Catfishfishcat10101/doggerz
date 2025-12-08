import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import SocialLinks from "@/components/SocialLinks.jsx";
import { HEADER_WRAPPER, CONTAINER, NAV_CLASSES, SOCIAL_WRAPPER } from "@/config/headerFooterStyles.js";

export default function Header() {
  return (
    <header className={HEADER_WRAPPER}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 bg-emerald-600 text-black px-2 py-1 rounded">Skip to content</a>
      <div className={CONTAINER}>
        <Link to="/" className="inline-flex items-center gap-4" aria-label="Home">
          {/* Match Landing wordmark exactly */}
          <div className="inline-flex flex-col">
            <span className="text-4xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.55)]">
              Doggerz
            </span>
            <span className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-250">
              virtual pup
            </span>
          </div>
        </Link>

        <nav className={NAV_CLASSES} aria-label="Main navigation">
          <Link
            to="/about"
            className="text-sm text-zinc-400 hover:text-emerald-200"
          >
            About
          </Link>

          <Link
            to="/adopt"
            className="hidden md:inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-md transition hover:bg-emerald-300"
          >
            Adopt
          </Link>

          <Link
            to="/login"
            className="text-sm rounded-md bg-zinc-900/60 px-3 py-1 text-zinc-100 hover:bg-zinc-900/80"
          >
            Login
          </Link>

          {/* Social buttons */}
          <SocialLinks className={SOCIAL_WRAPPER} />
        </nav>
      </div>
    </header>
  );
}

/* Header has no props */
