// src/layout/RequireGuest.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectUser, selectUserStatus } from "@/redux/userSlice";

function Gate({ children }) {
  const user = useSelector(selectUser);
  const status = useSelector(selectUserStatus);
  const location = useLocation();

  if (status === "loading" || status === "idle") {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="text-sm text-zinc-300">Loading…</div>
      </div>
    );
  }

  if (user?.uid) {
    // If the user somehow hits /login while authed, bounce them to where they came from or /game
    const to = location.state?.from || "/game";
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}

export default function RequireGuest({ children }) {
  return <Gate>{children}</Gate>;
}
RequireGuest.Outlet = function RequireGuestOutlet() {
  return (
    <Gate>
      <Outlet />
    </Gate>
  );
};
