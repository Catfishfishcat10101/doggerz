// src/AppRouter.jsx
<<<<<<< HEAD
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy-load route pages to reduce initial bundle size. Add additional
// routes here as pages are added. Keep route paths simple and stable.
const Landing = lazy(() => import("./pages/Landing.jsx"));
const AdoptPage = lazy(() => import("./pages/Adopt.jsx"));
const GamePage = lazy(() => import("./pages/GamePage.jsx"));
const Potty = lazy(() => import("./pages/Potty.jsx"));
const TemperamentReveal = lazy(() => import("./pages/TemperamentReveal.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Help = lazy(() => import("./pages/Help.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function AppRouter() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>Loading…</div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/adopt" element={<AdoptPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/potty" element={<Potty />} />
        <Route path="/temperament" element={<TemperamentReveal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/help" element={<Help />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
=======
// Central router for Doggerz

import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { PATHS } from "./routes.js";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CrashFallback from "./components/CrashFallback.jsx";

// Core pages
import Landing from "./pages/Landing.jsx";

// Route-level code splitting: keep Landing fast, lazy-load everything else.
const GamePage = React.lazy(() => import("./pages/Game.jsx"));
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
const LegalPage = React.lazy(() => import("./pages/Legal.jsx"));
const PrivacyPage = React.lazy(() => import("./pages/Privacy.jsx"));
const PottyPage = React.lazy(() => import("./pages/Potty.jsx"));
const TemperamentRevealPage = React.lazy(
  () => import("./pages/TemperamentReveal.jsx"),
);
const RainbowBridgePage = React.lazy(() => import("./pages/RainbowBridge.jsx"));
const NotFoundPage = React.lazy(() => import("./pages/NotFound.jsx"));

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

// Define all routes here
const router = createBrowserRouter(
  [
  {
      path: PATHS.HOME,
    element: <Landing />,
  },
  {
    path: PATHS.GAME,
    element: suspense(
      <ErrorBoundary fallback={GameCrashFallback}>
        <GamePage />
      </ErrorBoundary>
    ),
  },
  {
    path: PATHS.ADOPT,
    element: suspense(<AdoptPage />),
  },
  {
    path: PATHS.LOGIN,
    element: suspense(<LoginPage />),
  },
  {
    path: PATHS.SIGNUP,
    element: suspense(<SignupPage />),
  },
  {
    path: PATHS.ABOUT,
    element: suspense(<AboutPage />),
  },
  {
    path: PATHS.FAQ,
    element: suspense(<FaqPage />),
  },
  {
    path: PATHS.CONTACT,
    element: suspense(<ContactPage />),
  },
  {
    path: PATHS.HELP,
    element: suspense(<HelpPage />),
  },
  {
    path: PATHS.DEVELOPERS,
    element: suspense(<DevelopersPage />),
  },
  {
    path: PATHS.SETTINGS,
    element: suspense(<SettingsPage />),
  },
  {
      path: PATHS.STORE,
      element: suspense(<StorePage />),
    },
    {
      path: PATHS.BADGES,
      element: suspense(<BadgesPage />),
    },
    {
      path: PATHS.MEMORIES,
      element: suspense(<MemoryReelPage />),
    },
    {
      path: PATHS.LEGAL,
    element: suspense(<LegalPage />),
  },
  {
    path: PATHS.PRIVACY,
    element: suspense(<PrivacyPage />),
  },
  {
    path: PATHS.POTTY,
    element: suspense(<PottyPage />),
  },
  {
    path: PATHS.TEMPERAMENT_REVEAL,
    element: suspense(<TemperamentRevealPage />),
  },
  {
      path: PATHS.RAINBOW_BRIDGE,
      element: suspense(<RainbowBridgePage />),
    },
    {
    path: "*",
    element: suspense(<NotFoundPage />),
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
>>>>>>> master
  );
}
