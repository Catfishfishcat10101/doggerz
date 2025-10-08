// src/pages/Home.jsx
import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";

import { PATHS } from "@/config/routes.js";
import { metaForRoute } from "@/config/seo.js";
import { track, EVENTS } from "@/config/analytics.js";
import { canShowAds } from "@/config/ads.js";

import AdSlot from "@/components/ads/AdSlot.jsx";

export default function Home() {
  const user = useSelector(selectUser);
  const nav = useNavigate();
  const location = useLocation();

  // ----- Meta + analytics (no-ops in dev if you stubbed them) -----
  useEffect(() => {
    const m = metaForRoute({ title: "Home", url: window.location.href });
    document.title = m.title;
    ensureMeta("description", m.description);
    ensureOG(m);
    track(EVENTS?.page_view || "page_view", { page: "home" });
  }, []);

  // If the user arrived here after a guarded route redirect, surface a “Continue” CTA
  const returnTo = location.state?.from;

  const authed = !!user?.uid;
  const welcomeName = user?.displayName?.trim() || null;

  return (
    <section className="max-w-3xl mx-auto" aria-labelledby="home-title" data-route-title="true">
      {/* --------- Hero --------- */}
      <h1 id="home-title" className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        <span className="inline-block">
          Welcome{welcomeName ? `, ${welcomeName}` : ""}!
        </span>
        <span className="block mt-1 text-xl sm:text-2xl font-semibold text-white/70">
          Adopt a pixel pup. Your choices shape its behavior.
        </span>
      </h1>

      <p className="mt-4 text-white/80 leading-relaxed">
        Potty training is live — guide your pup to the yard before accidents happen.
        Needs are colorblind-safe and icon-labeled. Offline play is supported; installs as a PWA.
      </p>

      {/* --------- Primary CTAs --------- */}
      <div className="mt-6 flex flex-wrap gap-3">
        {authed ? (
          <>
            <Link
              to={returnTo || PATHS.GAME}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-slate-900"
              aria-label="Continue to the game"
            >
              {returnTo ? "Continue" : "Go to Game"}
            </Link>

            <Link
              to={PATHS.SETTINGS}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/70 focus:ring-offset-slate-900"
              aria-label="Open settings"
            >
              Settings
            </Link>
          </>
        ) : (
          <>
            <Link
              to={PATHS.LOGIN}
              state={{ from: PATHS.GAME }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-slate-900"
              aria-label="Sign in and start playing"
            >
              Sign in to Play
            </Link>

            <Link
              to={PATHS.SIGNUP}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/70 focus:ring-offset-slate-900"
              aria-label="Create an account"
            >
              Create account
            </Link>

            <Link
              to={PATHS.GAME}
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60 focus:ring-offset-slate-900"
              aria-label="Try a local demo without saving progress"
              title="Local demo (progress won’t sync)"
            >
              Try Demo
            </Link>
          </>
        )}
      </div>

      {/* --------- Monetization rail (dev shows placeholder, prod obeys canShowAds) --------- */}
      {canShowAds(location.pathname) && <AdSlot type="banner" className="my-6" />}

      {/* --------- Value props --------- */}
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        <Feature
          label="One dog per user"
          desc="Fair play enforced in Firestore rules. Your pup is uniquely yours."
        />
        <Feature
          label="Needs & mood system"
          desc="Gentle decay, no click-grind. Icons + labels (not color-only)."
        />
        <Feature
          label="Responsive & accessible"
          desc="High contrast, visible focus, reduced-motion friendly."
        />
        <Feature
          label="Offline-ready PWA"
          desc="Install to your device and play without a connection."
        />
      </ul>

      {/* --------- Secondary navigation --------- */}
      <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/70">
        <Link to={PATHS.SHOP} className="underline underline-offset-4 hover:opacity-90">
          Browse Shop
        </Link>
        <span aria-hidden="true" className="mx-1 opacity-40">•</span>
        <Link to={PATHS.PRIVACY} className="underline underline-offset-4 hover:opacity-90">
          Privacy
        </Link>
        <span aria-hidden="true" className="mx-1 opacity-40">•</span>
        <Link to={PATHS.TERMS} className="underline underline-offset-4 hover:opacity-90">
          Terms
        </Link>
      </div>
    </section>
  );
}

/** Feature line item with non-color affordance */
function Feature({ label, desc }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/20"
      >
        {/* geometric tick instead of color-only cue */}
        <div className="h-2 w-3 border-b-2 border-r-2 rotate-45" />
      </span>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-white/70">{desc}</p>
      </div>
    </li>
  );
}

/* -------------------- tiny meta utilities (no helmet) -------------------- */
function ensureMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content || "");
}

function ensureOG({ og, twitter, canonical }) {
  if (!og) return;
  setOG("og:title", og.title);
  setOG("og:description", og.description);
  setOG("og:image", og.image);
  setOG("og:url", og.url);
  setOG("og:site_name", og.site_name);
  setOG("og:type", og.type || "website");

  setTwitter("twitter:card", twitter?.card || "summary_large_image");
  setTwitter("twitter:site", twitter?.site || "");
  setTwitter("twitter:title", twitter?.title || og.title);
  setTwitter("twitter:description", twitter?.description || og.description);
  setTwitter("twitter:image", twitter?.image || og.image);

  if (canonical) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);
  }
}
function setOG(prop, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function setTwitter(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
