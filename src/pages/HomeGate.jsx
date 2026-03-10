/** @format */

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Landing from "@/pages/Landing.jsx";
import { PATHS } from "@/routes.js";
import { selectIsLoggedIn } from "@/redux/userSlice.js";

export default function HomeGate() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  if (isLoggedIn) return <Navigate to={PATHS.GAME} replace />;
  return <Landing />;
}
