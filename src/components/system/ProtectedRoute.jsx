import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import HeistOverlay from "@/components/ui/HeistOverlay.jsx";
import { resolveHeistRoute } from "@/utils/heistRoutes.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const activeHeist = useSelector((state) => state?.dog?.surprise?.active || null);

  const isButtonHeist =
    String(activeHeist?.type || "").toUpperCase() === "STOLEN_BUTTON";
  const targetRoute = resolveHeistRoute(activeHeist?.stolenAction || "");

  if (isButtonHeist && targetRoute && targetRoute === location.pathname) {
    return (
      <HeistOverlay
        stolenAction={activeHeist?.stolenAction || ""}
        message={activeHeist?.message || ""}
      />
    );
  }

  return children;
}

