// src/components/screens/LoadingScreen.jsx

import { useEffect, useRef } from "react";
import { initLoadingTipRotation } from "@/data/loadingTips.js";

/**
 * LoadingScreen - App boot loader with rotating tips
 *
 * Displays loading indicator and cycles through educational tips
 * while the app initializes auth, data, and game engine.
 */
export default function LoadingScreen({ isVisible = true }) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    const titleEl = document.getElementById("loading-tip-title");
    const descEl = document.getElementById("loading-tip-desc");

    if (titleEl && descEl) {
      // Start the tip rotation and store cleanup function
      cleanupRef.current = initLoadingTipRotation(titleEl, descEl);
    }

    // Cleanup on unmount or visibility change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#040a14] text-white">
      <div className="w-full max-w-md px-6 text-center">
        {/* Animated loader dot */}
        <div className="mb-12 flex justify-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse animation-delay-200" />
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse animation-delay-400" />
        </div>

        {/* Rotating tip section */}
        <div className="space-y-4">
          <h2
            id="loading-tip-title"
            className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200 transition-opacity duration-300"
          >
            {/* Populated by initLoadingTipRotation */}
          </h2>
          <p
            id="loading-tip-desc"
            className="text-sm leading-6 text-zinc-300 transition-opacity duration-300"
          >
            {/* Populated by initLoadingTipRotation */}
          </p>
        </div>

        {/* Loading text */}
        <div className="mt-12 text-xs uppercase tracking-[0.18em] text-zinc-500">
          Initializing Doggerz...
        </div>
      </div>
    </div>
  );
}
