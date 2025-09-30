import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | anon
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setStatus(u ? "authed" : "anon");
    });
    return unsub;
  }, []);

  if (status === "loading") {
    return <div className="p-6 text-sm opacity-70">Checking session…</div>;
  }
  if (status === "anon") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
}