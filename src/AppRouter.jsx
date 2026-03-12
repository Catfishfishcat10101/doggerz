/** @format */

// src/AppRouter.jsx
// Central router for Doggerz (layout-safe)

import * as React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";

import { PATHS } from "./routes.js";

import ErrorBoundary from "./components/system/ErrorBoundary.jsx";
import CrashFallback from "./components/system/CrashFallback.jsx";
import ProtectedRoute from "./components/system/ProtectedRoute.jsx";
import AppShell from "./layout/AppShell.jsx";
import ModalHost from "./components/ui/modals/ModalHost.jsx";
import { selectIsAuthResolved } from "./redux/userSlice.js";

// Keep Landing fast; lazy-load everything else.
import HomeGate from "./pages/HomeGate.jsx";

const DogRouteShell = React.lazy(
  () => import("./components/dog/DogRouteShell.jsx")
);
const GamePage = React.lazy(() => import("./pages/Game.jsx"));
const MenuPage = React.lazy(() => import("./pages/Menu.jsx"));
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

const stripLeadingSlash = (path) => String(path || "").replace(/^\//, "");
const dogRoutes = Object.freeze([
  {
    path: PATHS.SKILL_TREE,
    node: (
      <ProtectedRoute>
        <SkillTreePage />
      </ProtectedRoute>
    ),
    label: "Loading skill tree…",
  },
  {
    path: PATHS.STORE,
    node: (
      <ProtectedRoute>
        <StorePage />
      </ProtectedRoute>
    ),
    label: "Loading store…",
  },
  {
    path: PATHS.MEMORIES,
    node: (
      <ProtectedRoute>
        <MemoryReelPage />
      </ProtectedRoute>
    ),
    label: "Loading memories…",
  },
  { path: PATHS.DREAMS, node: <DreamsPage />, label: "Loading dreams…" },
  { path: PATHS.POTTY, node: <PottyPage />, label: "Loading potty…" },
  {
    path: PATHS.TEMPERAMENT_REVEAL,
    node: <TemperamentRevealPage />,
    label: "Loading temperament…",
  },
  {
    path: PATHS.RAINBOW_BRIDGE,
    node: <RainbowBridgePage />,
    label: "Loading rainbow bridge…",
  },
]);

const utilityRoutes = Object.freeze([
  {
    path: PATHS.MENU,
    node: (
      <ProtectedRoute>
        <MenuPage />
      </ProtectedRoute>
    ),
    label: "Loading menu…",
  },
  { path: PATHS.ADOPT, node: <AdoptPage />, label: "Loading adoption…" },
  { path: PATHS.LOGIN, node: <LoginPage />, label: "Loading login…" },
  { path: PATHS.SIGNUP, node: <SignupPage />, label: "Loading sign up…" },
  { path: PATHS.ABOUT, node: <AboutPage />, label: "Loading about…" },
  { path: PATHS.FAQ, node: <FaqPage />, label: "Loading FAQ…" },
  { path: PATHS.CONTACT, node: <ContactPage />, label: "Loading contact…" },
  { path: PATHS.HELP, node: <HelpPage />, label: "Loading help…" },
  {
    path: PATHS.DEVELOPERS,
    node: <DevelopersPage />,
    label: "Loading developers…",
  },
  {
    path: PATHS.SETTINGS,
    node: <SettingsPage />,
    label: "Loading settings…",
  },
  { path: PATHS.LEGAL, node: <LegalPage />, label: "Loading legal…" },
  { path: PATHS.PRIVACY, node: <PrivacyPage />, label: "Loading privacy…" },
]);

function makeCrashFallback(title, subtitle) {
  return function RouteCrashFallback({ error }) {
    return (
      <CrashFallback
        title={title}
        subtitle={subtitle}
        error={error}
        reset={undefined}
      />
    );
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
  const [tipIndex, setTipIndex] = React.useState(0);
  const tips = React.useMemo(
    () => [
      "Your pup remembers routines. Frequent check-ins strengthen bond.",
      "Neon mode online. Loading the next view…",
      "If loading stalls, refresh and jump back in.",
    ],
    []
  );

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [tips.length]);

  return (
    <div className="min-h-[64vh] grid place-items-center px-4 py-10 text-zinc-100 bg-[radial-gradient(circle_at_20%_12%,rgba(16,185,129,0.16),transparent_40%),radial-gradient(circle_at_84%_88%,rgba(52,211,153,0.14),transparent_44%),linear-gradient(180deg,#030712_0%,#020617_100%)]">
      <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-emerald-400/30 bg-black/55 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_90px_rgba(0,0,0,0.55),0_0_70px_rgba(16,185,129,0.16)] backdrop-blur-md">
        <div className="relative border-b border-white/10 px-6 py-5">
          <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-200/85">
            Doggerz
          </div>
          <div className="mt-2 text-xl font-black tracking-tight text-zinc-100">
            {label}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Loading UI chunk and prepping dog state.
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-lime-300" />
          </div>

          <p className="mt-4 min-h-5 text-xs text-zinc-300">{tips[tipIndex]}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/25"
            >
              Refresh now
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = PATHS.HOME;
              }}
              className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-black/45"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthReadyGate({ children, label = "Connecting dog data…" }) {
  const isAuthResolved = useSelector(selectIsAuthResolved);
  if (!isAuthResolved) {
    return <RouteFallback label={label} />;
  }
  return children;
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

function RouterFrame() {
  return (
    <>
      <Outlet />
      <ModalHost />
    </>
  );
}

// Layout-safe router: keep `/game` outside AppShell
const router = createBrowserRouter(
  [
    {
      element: <RouterFrame />,
      children: [
        // Game route: full-screen, no AppShell
        {
          path: PATHS.GAME,
          element: suspenseWithLabel(
            withCrashBoundary(
              <AuthReadyGate label="Connecting yard…">
                <GamePage />
              </AuthReadyGate>,
              GameCrashFallback
            ),
            "Loading yard…"
          ),
        },

        {
          path: PATHS.HOME,
          element: <AppShell />,
          children: [
            { index: true, element: <HomeGate /> },
            ...utilityRoutes.map((route) => ({
              path: stripLeadingSlash(route.path),
              element: suspenseWithLabel(
                withCrashBoundary(route.node),
                route.label
              ),
            })),
            {
              element: suspenseWithLabel(
                withCrashBoundary(
                  <AuthReadyGate label="Connecting dog data…">
                    <DogRouteShell />
                  </AuthReadyGate>
                ),
                "Loading dog data…"
              ),
              children: dogRoutes.map((route) => ({
                path: stripLeadingSlash(route.path),
                element: suspenseWithLabel(
                  withCrashBoundary(route.node),
                  route.label
                ),
              })),
            },
            {
              path: stripLeadingSlash(PATHS.NOT_FOUND),
              element: suspense(withCrashBoundary(<NotFoundPage />)),
            },

            // Catch-all (must be last)
            {
              path: "*",
              element: suspense(withCrashBoundary(<NotFoundPage />)),
            },
          ],
        },
        {
          path: "*",
          element: suspense(withCrashBoundary(<NotFoundPage />)),
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true,
    },
  }
);

export default function AppRouter() {
  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
}
