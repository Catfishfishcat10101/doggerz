// src/layout/AuthedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthedLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
      <Outlet />
    </div>
  );
}
