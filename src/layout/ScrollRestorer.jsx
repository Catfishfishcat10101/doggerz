// src/layout/ScrollRestorer.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollRestorer() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Snap to top on route changes; avoids smooth scroll stealing focus
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
