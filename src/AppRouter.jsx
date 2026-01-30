/** @format */

// src/AppRouter.jsx
// Central router for Doggerz (layout-safe)

import * as React from "react";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";

import { PATHS } from "./routes.js";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CrashFallback from "./components/CrashFallback.jsx";
import AppShell from "./layout/AppShell.jsx";

// Keep Landing fast; lazy-load everything else.
import Landing from "./pages/Landing.jsx";

const GamePage = React.lazy(() => import("./pages/Game.jsx"));
const SkillTreePage = React.lazy(() => import("./pages/SkillTree.jsx"));
const AdoptPage = React.lazy(() => import("./pages/Adopt.jsx"));
const LoginPage = React.lazy(() => import("./pages/Login.jsx"));
const SignupPage = React.lazy(() => import("./pages/Signup.jsx"));
const AboutPage = React.lazy(() => import("./pages/About.jsx"));
const FaqPage = React.lazy(() => import("./pages/Faq.jsx"));
const ContactPage = React.lazy(() => import("./pages/Contact.jsx"));
const HelpPage = React.lazy(() => import("./pages/Help.jsx"));
const DevelopersPage = React.lazy(() => import("./pages/Developers.jsx"));
const SettingsPage = React.lazy(() => import("./pages/Settings.jsx"));
const StorePage = React.lazy(() => import("./pages/Store.jsx"));
const BadgesPage = React.lazy(() => import("./pages/Badges.jsx"));
const MemoryReelPage = React.lazy(() => import("./pages/MemoryReel.jsx"));
const DreamsPage = React.lazy(() => import("./pages/Dreams.jsx"));
const LegalPage = React.lazy(() => import("./pages/Legal.jsx"));
const PrivacyPage = React.lazy(() => import("./pages/Privacy.jsx"));
const PottyPage = React.lazy(() => import("./pages/Potty.jsx"));
const TemperamentRevealPage = React.lazy(
  () => import("./pages/TemperamentReveal.jsx")
);
const RainbowBridgePage = React.lazy(() => import("./pages/RainbowBridge.jsx"));
const NotFoundPage = React.lazy(() => import("./pages/NotFound.jsx"));
const SpriteTestPage = React.lazy(() => import("./pages/SpriteTest.jsx"));

const stripLeadingSlash = (path) => String(path || "").replace(/^\//, "");

function makeCrashFallback(title, subtitle) {
  return function RouteCrashFallback({ error }) {
    return <CrashFallback title={title} subtitle={subtitle} error={error} />;
  };
}

const GameCrashFallback = makeCrashFallback(
  "The yard tripped over a squirrel",
  "The game screen crashed, but the rest of the app is OK. Refresh to recover."
);

const DefaultRouteCrashFallback = makeCrashFallback(
  "Doggerz hit a snag",
  "This page crashed, but the rest of the app is OK. Try refreshing."
);

function RouteFallback({ label = "Loading." }) {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold text-zinc-200">
          {label}
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400/70" />
          </div>
          <div className="text-[12px] text-zinc-400">
            If this takes more than a few seconds, try refreshing.
          </div>
        </div>

        <div className="mt-4">
          <Link
            to={PATHS.HOME}
            className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

const suspense = (node) => (
  <React.Suspense fallback={<RouteFallback />}>{node}</React.Suspense>
);

const suspenseWithLabel = (node, label) => (
  <React.Suspense fallback={<RouteFallback label={label} />}>
    {node}
  </React.Suspense>
);

const withCrashBoundary = (node, fallback = DefaultRouteCrashFallback) => (
  <ErrorBoundary fallback={fallback}>{node}</ErrorBoundary>
);

// Layout-safe router: keep `/game` outside AppShell
const router = createBrowserRouter(
  [
    // Game route: full-screen, no AppShell
    {
      path: PATHS.GAME,
      element: suspenseWithLabel(
        withCrashBoundary(<GamePage />, GameCrashFallback),
        "Loading yard…"
      ),
    },

    // Everything else: inside AppShell
    {
      path: PATHS.HOME,
      element: <AppShell />,
      children: [
        { index: true, element: <Landing /> },

        {
          path: stripLeadingSlash(PATHS.SKILL_TREE),
          element: suspenseWithLabel(
            withCrashBoundary(<SkillTreePage />),
            "Loading skill tree…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.ADOPT),
          element: suspenseWithLabel(
            withCrashBoundary(<AdoptPage />),
            "Loading adoption…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.LOGIN),
          element: suspenseWithLabel(
            withCrashBoundary(<LoginPage />),
            "Loading login…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.SIGNUP),
          element: suspenseWithLabel(
            withCrashBoundary(<SignupPage />),
            "Loading sign up…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.ABOUT),
          element: suspenseWithLabel(
            withCrashBoundary(<AboutPage />),
            "Loading about…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.FAQ),
          element: suspenseWithLabel(
            withCrashBoundary(<FaqPage />),
            "Loading FAQ…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.CONTACT),
          element: suspenseWithLabel(
            withCrashBoundary(<ContactPage />),
            "Loading contact…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.HELP),
          element: suspenseWithLabel(
            withCrashBoundary(<HelpPage />),
            "Loading help…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.DEVELOPERS),
          element: suspenseWithLabel(
            withCrashBoundary(<DevelopersPage />),
            "Loading developers…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.SETTINGS),
          element: suspenseWithLabel(
            withCrashBoundary(<SettingsPage />),
            "Loading settings…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.STORE),
          element: suspenseWithLabel(
            withCrashBoundary(<StorePage />),
            "Loading store…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.BADGES),
          element: suspenseWithLabel(
            withCrashBoundary(<BadgesPage />),
            "Loading badges…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.MEMORIES),
          element: suspenseWithLabel(
            withCrashBoundary(<MemoryReelPage />),
            "Loading memories…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.DREAMS),
          element: suspenseWithLabel(
            withCrashBoundary(<DreamsPage />),
            "Loading dreams…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.LEGAL),
          element: suspenseWithLabel(
            withCrashBoundary(<LegalPage />),
            "Loading legal…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.PRIVACY),
          element: suspenseWithLabel(
            withCrashBoundary(<PrivacyPage />),
            "Loading privacy…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.POTTY),
          element: suspenseWithLabel(
            withCrashBoundary(<PottyPage />),
            "Loading potty…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.TEMPERAMENT_REVEAL),
          element: suspenseWithLabel(
            withCrashBoundary(<TemperamentRevealPage />),
            "Loading temperament…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.RAINBOW_BRIDGE),
          element: suspenseWithLabel(
            withCrashBoundary(<RainbowBridgePage />),
            "Loading rainbow bridge…"
          ),
        },
        {
          path: stripLeadingSlash(PATHS.SPRITE_TEST),
          element: suspenseWithLabel(
            withCrashBoundary(<SpriteTestPage />),
            "Loading sprite test…"
          ),
        },

        // Catch-all (must be last)
        { path: "*", element: suspense(withCrashBoundary(<NotFoundPage />)) },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
