// src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";

import Home from "@/pages/Home.jsx";
import Game from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import Settings from "@/pages/Settings.jsx";
import Shop from "@/pages/Shop.jsx";
import NotFound from "@/pages/NotFound.jsx";
import Leaderboard from "@/pages/Leaderboard.jsx";
import NewDog from "@/pages/NewDog.jsx";
import Profile from "@/pages/Profile.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import RequireOnboarding from "./RequireOnboarding.jsx";

export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  GAME: "/game",
  NEW_DOG: "/new-dog",
  SHOP: "/shop",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  LEADERBOARD: "/leaderboard",
  NOT_FOUND: "*",
};

export function startRouteAfterAuth({ hasDog }) {
  return hasDog ? PATHS.GAME : PATHS.NEW_DOG;
}

export const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: PATHS.LOGIN.slice(1), element: <Login /> },
      { path: PATHS.SIGNUP.slice(1), element: <Signup /> },
      { path: PATHS.SHOP.slice(1), element: <Shop /> },
      { path: PATHS.SETTINGS.slice(1), element: <Settings /> },
      { path: PATHS.PROFILE.slice(1), element: <Profile /> },
      { path: PATHS.LEADERBOARD.slice(1), element: <Leaderboard /> },

      {
        path: PATHS.NEW_DOG.slice(1),
        element: (
          <ProtectedRoute>
            <NewDog />
          </ProtectedRoute>
        ),
      },
      {
        path: PATHS.GAME.slice(1),
        element: (
          <ProtectedRoute>
            <RequireOnboarding>
              <Game />
            </RequireOnboarding>
          </ProtectedRoute>
        ),
      },

      { path: PATHS.NOT_FOUND, element: <NotFound /> },
    ],
  },
]);
