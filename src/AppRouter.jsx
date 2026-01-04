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

function GameCrashFallback({ error }) {
  return (
    <CrashFallback
      title="The yard tripped over a squirrel"
      subtitle="The game screen crashed, but the rest of the app is OK. Refresh to recover."
      error={error}
    />
  );
}

function RouteFallback() {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-zinc-950 text-zinc-100">
      <div className="text-center">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    </div>
  );
}

const suspense = (node) => (
  <React.Suspense fallback={<RouteFallback />}>{node}</React.Suspense>
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
          path: PATHS.GAME.replace(/^\//, ""),
          element: suspense(
            <ErrorBoundary fallback={GameCrashFallback}>
              <GamePage />
            </ErrorBoundary>
          ),
        },

        {
          path: PATHS.SKILL_TREE.replace(/^\//, ""),
          element: suspense(<SkillTreePage />),
        },

        {
          path: PATHS.ADOPT.replace(/^\//, ""),
          element: suspense(<AdoptPage />),
        },
        {
          path: PATHS.LOGIN.replace(/^\//, ""),
          element: suspense(<LoginPage />),
        },
        {
          path: PATHS.SIGNUP.replace(/^\//, ""),
          element: suspense(<SignupPage />),
        },
        {
          path: PATHS.ABOUT.replace(/^\//, ""),
          element: suspense(<AboutPage />),
        },
        { path: PATHS.FAQ.replace(/^\//, ""), element: suspense(<FaqPage />) },
        {
          path: PATHS.CONTACT.replace(/^\//, ""),
          element: suspense(<ContactPage />),
        },
        {
          path: PATHS.HELP.replace(/^\//, ""),
          element: suspense(<HelpPage />),
        },
        {
          path: PATHS.DEVELOPERS.replace(/^\//, ""),
          element: suspense(<DevelopersPage />),
        },
        {
          path: PATHS.SETTINGS.replace(/^\//, ""),
          element: suspense(<SettingsPage />),
        },
        {
          path: PATHS.STORE.replace(/^\//, ""),
          element: suspense(<StorePage />),
        },
        {
          path: PATHS.BADGES.replace(/^\//, ""),
          element: suspense(<BadgesPage />),
        },
        {
          path: PATHS.MEMORIES.replace(/^\//, ""),
          element: suspense(<MemoryReelPage />),
        },
        {
          path: PATHS.DREAMS.replace(/^\//, ""),
          element: suspense(<DreamsPage />),
        },
        {
          path: PATHS.LEGAL.replace(/^\//, ""),
          element: suspense(<LegalPage />),
        },
        {
          path: PATHS.PRIVACY.replace(/^\//, ""),
          element: suspense(<PrivacyPage />),
        },
        {
          path: PATHS.POTTY.replace(/^\//, ""),
          element: suspense(<PottyPage />),
        },
        {
          path: PATHS.TEMPERAMENT_REVEAL.replace(/^\//, ""),
          element: suspense(<TemperamentRevealPage />),
        },
        {
          path: PATHS.RAINBOW_BRIDGE.replace(/^\//, ""),
          element: suspense(<RainbowBridgePage />),
        },

        // ✅ Sprite pipeline verification route
        {
          path: PATHS.SPRITE_TEST.replace(/^\//, ""),
          element: suspense(<SpriteTestPage />),
        },

        // Catch-all (must be last)
        { path: "*", element: suspense(<NotFoundPage />) },
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
  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  );
}
