// src/App.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Splash   from "@/components/UI/Splash.jsx";
import Login    from "@/components/Auth/Login.jsx";
import Signup   from "@/components/Auth/Signup.jsx";
import NewPup   from "@/components/Setup/NewPup.jsx";
import GameScreen from "@/components/UI/GameScreen.jsx";

function Protected({ children }) {
  return children; // wire real auth later
}

const router = createBrowserRouter(
  [
    { path: "/", element: <Splash /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/setup/new", element: <NewPup /> },
    {
      path: "/play",
      element: (
        <Protected>
          <GameScreen />
        </Protected>
      ),
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default function App() {
  return <RouterProvider router={router} />;
}
