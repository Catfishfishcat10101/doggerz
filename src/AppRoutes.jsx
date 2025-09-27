import React from "react";
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import Splash from "@/components/UI/Splash.jsx";
import Login from "@/components/Auth/Login.jsx";
import Signup from "@/components/Auth/Signup.jsx";
import NewPup from "@/components/Setup/NewPup.jsx";
import GameScreen from "@/components/UI/GameScreen.jsx";

// Gate /play until the pup has a name (saved in localStorage)
function RequireDogName({ children }) {
  const hasName =
    typeof localStorage !== "undefined" && !!localStorage.getItem("dogName");
  return hasName ? children : <Navigate to="/setup/new" replace />;
}

export const router = createBrowserRouter(
  [
    { path: "/", element: <Splash /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/setup/new", element: <NewPup /> },
    {
      path: "/play",
      element: (
        <RequireDogName>
          <GameScreen />
        </RequireDogName>
      ),
    },
    { path: "*", element: <Navigate to="/" replace /> }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);
