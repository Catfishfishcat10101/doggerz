// src/layout/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Outlet />
    </div>
  );
}
