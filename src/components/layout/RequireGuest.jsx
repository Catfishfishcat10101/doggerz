import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectUserStatus } from "@/redux/userSlice";

export default function RequireGuest() {
  const user = useSelector(selectUser);
  const status = useSelector(selectUserStatus);
  const loc = useLocation();

  if (status === "loading") {
    return <div className="p-6 text-zinc-300">Booting…</div>;
  }

  if (user) {
    // route back where they came from or default to /game
    const to = (loc.state && loc.state.from?.pathname) || "/game";
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}
