import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./AppRoutes.jsx";
import AuthListener from "@/components/Auth/AuthListener.jsx";

export default function App() {
  return (
    <>
      {/* Keeps Redux/UI in sync with Firebase auth; renders nothing */}
      <AuthListener />
      <RouterProvider router={router} />
    </>
  );
}
