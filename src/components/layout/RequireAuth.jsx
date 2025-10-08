import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectUserStatus } from "@/redux/userSlice";

export default function RequireAuth() {
  const user = useSelector(selectUser);
  const status = useSelector(selectUserStatus);
  const loc = useLocation();

  if (status === "loading") {
    return <div className="p-6 text-zinc-300">Checking auth…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
