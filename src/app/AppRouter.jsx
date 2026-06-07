
import * as React from "react";
import {
  Navigate,
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { PATHS } from "./routes.js";

import ErrorBoundary from "@/components/system/ErrorBoundary.jsx";
import CrashFallback from "@/components/system/CrashFallback.jsx";
import ProtectedRoute from "@/components/system/ProtectedRoute.jsx";
import AppShell from "@/components/layout/AppShell.jsx";
import ModalHost from "@/components/ui/modals/ModalHost.jsx";
import DoggerzLoadingScreen from "@/components/game/DoggerzLoadingScreen.jsx";
import { selectIsAuthResolved } from "@/store/userSlice.js";

// Keep Landing fast; lazy-load everything else.
import StartScreen from "@/components/screens/StartScreen.jsx";
import Landing from "@/pages/Landing.jsx";

const DogRouteShell = React.lazy(
  () => import("@/components/dog/shells/DogRouteShell.jsx")
);
const GamePage = React.lazy(() => import("@/pages/Game.jsx"));
const MenuPage = React.lazy(() => import("@/pages/Menu.jsx"));
const SkillTreePage = React.lazy(() => import("@/pages/SkillTree.jsx"));
const AdoptPage = React.lazy(() => import("@/pages/Adopt.jsx"));
const LoginPage = React.lazy(() => import("@/pages/Login.jsx"));
const SignupPage = React.lazy(() => import("@/pages/Signup.jsx"));
const AboutPage = React.lazy(() => import("@/pages/About.jsx"));
const FaqPage = React.lazy(() => import("@/pages/Faq.jsx"));
const ContactPage = React.lazy(() => import("@/pages/Contact.jsx"));
const HelpPage = React.lazy(() => import("@/pages/Help.jsx"));
const SettingsPage = React.lazy(() => import("@/pages/Settings.jsx"));
const StorePage = React.lazy(() => import("@/pages/Store.jsx"));
const MemoryReelPage = React.lazy(() => import("@/pages/MemoryReel.jsx"));
const DreamsPage = React.lazy(() => import("@/pages/Dreams.jsx"));
const LegalPage = React.lazy(() => import("@/pages/Legal.jsx"));
const PrivacyPage = React.lazy(() => import("@/pages/Privacy.jsx"));
const PottyPage = React.lazy(() => import("@/pages/Potty.jsx"));
const TemperamentRevealPage = React.lazy(
  () => import("@/pages/TemperamentReveal.jsx")
);
const RainbowBridgePage = React.lazy(() => import("@/pages/RainbowBridge.jsx"));
const DevelopersPage = React.lazy(() => import("@/pages/Developers.jsx"));
const NotFoundPage = React.lazy(() => import("@/pages/NotFound.jsx"));

const stripLeadingSlash = (path) => String(path || "").replace(/^\//, "");
const dogRoutes = Object.freeze([
  {
    path: PATHS.SKILL_TREE,
    node: (
      <ProtectedRoute>
        <SkillTreePage />
      </ProtectedRoute>
    ),
    label: "Loading skill tree...",
  },
  {
    path: PATHS.STORE,
    node: (
      <ProtectedRoute>
        <StorePage />
      </ProtectedRoute>
    ),
    label: "Loading store...",
  },
  {
    path: PATHS.MEMORIES,
    node: (
      <ProtectedRoute>
        <MemoryReelPage />
      </ProtectedRoute>
    ),
    label: "Loading memories...",
  },
  { path: PATHS.DREAMS, node: <DreamsPage />, label: "Loading dreams..." },
  { path: PATHS.POTTY, node: <PottyPage />, label: "Loading potty..." },
  {
    path: PATHS.TEMPERAMENT_REVEAL,
    node: <TemperamentRevealPage />,
    label: "Loading temperament...",
  },
  {
    path: PATHS.RAINBOW_BRIDGE,
    node: <RainbowBridgePage />,
    label: "Loading rainbow bridge...",
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
    label: "Loading menu...",
  },
  { path: PATHS.ADOPT, node: <AdoptPage />, label: "Loading adoption..." },
  { path: PATHS.LOGIN, node: <LoginPage />, label: "Loading login..." },
  { path: PATHS.SIGNUP, node: <SignupPage />, label: "Loading sign up..." },
  { path: PATHS.ABOUT, node: <AboutPage />, label: "Loading about..." },
  {
    path: PATHS.FAQ,
    node: <FaqPage />,
    label: "Loading FAQs...",
  },
  { path: PATHS.CONTACT, node: <ContactPage />, label: "Loading contact..." },
  { path: PATHS.HELP, node: <HelpPage />, label: "Loading help..." },
  {
    path: PATHS.DEVELOPERS,
    node: <DevelopersPage />,
    label: "Loading developers...",
  },
  {
    path: PATHS.SETTINGS,
    node: <SettingsPage />,
    label: "Loading settings...",
  },
  { path: PATHS.LEGAL, node: <LegalPage />, label: "Loading legal..." },
  { path: PATHS.PRIVACY, node: <PrivacyPage />, label: "Loading privacy..." },
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
  "The yard could not load",
  "The game screen stopped unexpectedly. Refresh to return to your pup."
);

const DefaultRouteCrashFallback = makeCrashFallback(
  "This screen could not load",
  "Refresh the app and try again."
);

function RouteFallback({ label = "Loading." }) {
  const [tipIndex, setTipIndex] = React.useState(0);
  const tips = React.useMemo(
    () => [
      "Your pup remembers steady care.",
      "Getting the next yard view ready.",
      "Your session is opening into Doggerz.",
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
    <DoggerzLoadingScreen
      title={label}
      subtitle="Preparing your pup data and opening the yard."
      tip={tips[tipIndex]}
      className="min-h-[64vh]"
    />
  );
}

function AuthReadyGate({ children, label = "Connecting dog data..." }) {
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
              <AuthReadyGate label="Connecting yard...">
                <GamePage />
              </AuthReadyGate>,
              GameCrashFallback
            ),
            "Loading yard..."
          ),
        },
        {
          path: PATHS.CARE,
          element: suspenseWithLabel(
            withCrashBoundary(
              <AuthReadyGate label="Connecting care...">
                <GamePage />
              </AuthReadyGate>,
              GameCrashFallback
            ),
            "Loading care..."
          ),
        },

        {
          path: PATHS.HOME,
          element: <AppShell />,
          children: [
            { index: true, element: <StartScreen /> },
            {
              path: "landing",
              element: <Landing />,
            },
            {
              path: "homegate",
              element: <Navigate to={PATHS.HOME} replace />,
            },
            {
              path: "memoryreel",
              element: <Navigate to={PATHS.MEMORIES} replace />,
            },
            {
              path: "skilltree",
              element: <Navigate to={PATHS.SKILL_TREE} replace />,
            },
            {
              path: "temperamentreveal",
              element: <Navigate to={PATHS.TEMPERAMENT_REVEAL} replace />,
            },
            {
              path: "rainbowbridge",
              element: <Navigate to={PATHS.RAINBOW_BRIDGE} replace />,
            },
            {
              path: "notfound",
              element: <Navigate to={PATHS.NOT_FOUND} replace />,
            },
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
                  <AuthReadyGate label="Connecting dog data...">
                    <DogRouteShell />
                  </AuthReadyGate>
                ),
                "Loading dog data..."
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
