/** @format */

// src/AppRouter.jsx
// Central router for Doggerz

import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { PATHS } from "./routes.js";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CrashFallback from "./components/CrashFallback.jsx";

// ✅ NEW: App shell layout (header/footer logic lives here)
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

// ✅ NEW: Sprite test page
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

function RouteFallback() {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold text-zinc-200">
          Loading…
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
          <a
            href={PATHS.HOME}
            className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
          >
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
}

const suspense = (node) => (
  <React.Suspense fallback={<RouteFallback />}>{node}</React.Suspense>
);

const withCrashBoundary = (node, fallback = DefaultRouteCrashFallback) => (
  <ErrorBoundary fallback={fallback}>{node}</ErrorBoundary>
);

const router = createBrowserRouter(
  [
    {
      // ✅ Parent layout route provides header/footer and an <Outlet />
      path: "/",
      element: <AppShell />,
      children: [
        { index: true, element: <Landing /> },

        {
          path: stripLeadingSlash(PATHS.GAME),
          element: suspense(withCrashBoundary(<GamePage />, GameCrashFallback)),
        },

        {
          path: stripLeadingSlash(PATHS.SKILL_TREE),
          element: suspense(withCrashBoundary(<SkillTreePage />)),
        },

        {
          path: stripLeadingSlash(PATHS.ADOPT),
          element: suspense(withCrashBoundary(<AdoptPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.LOGIN),
          element: suspense(withCrashBoundary(<LoginPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.SIGNUP),
          element: suspense(withCrashBoundary(<SignupPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.ABOUT),
          element: suspense(withCrashBoundary(<AboutPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.FAQ),
          element: suspense(withCrashBoundary(<FaqPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.CONTACT),
          element: suspense(withCrashBoundary(<ContactPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.HELP),
          element: suspense(withCrashBoundary(<HelpPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.DEVELOPERS),
          element: suspense(withCrashBoundary(<DevelopersPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.SETTINGS),
          element: suspense(withCrashBoundary(<SettingsPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.STORE),
          element: suspense(withCrashBoundary(<StorePage />)),
        },
        {
          path: stripLeadingSlash(PATHS.BADGES),
          element: suspense(withCrashBoundary(<BadgesPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.MEMORIES),
          element: suspense(withCrashBoundary(<MemoryReelPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.DREAMS),
          element: suspense(withCrashBoundary(<DreamsPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.LEGAL),
          element: suspense(withCrashBoundary(<LegalPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.PRIVACY),
          element: suspense(withCrashBoundary(<PrivacyPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.POTTY),
          element: suspense(withCrashBoundary(<PottyPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.TEMPERAMENT_REVEAL),
          element: suspense(withCrashBoundary(<TemperamentRevealPage />)),
        },
        {
          path: stripLeadingSlash(PATHS.RAINBOW_BRIDGE),
          element: suspense(withCrashBoundary(<RainbowBridgePage />)),
        },

        // ✅ Sprite pipeline verification route
        {
          path: stripLeadingSlash(PATHS.SPRITE_TEST),
          element: suspense(withCrashBoundary(<SpriteTestPage />)),
        },

        // Catch-all (must be last)
        { path: "*", element: suspense(withCrashBoundary(<NotFoundPage />)) },
      ],
    },
  ],
  {
    // Future flags removed to keep type-checking happy across router versions.
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
