// src/pages/NotFound.jsx
// Doggerz: 404 Not Found page. Handles unknown routes.

import React from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes.js";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * NotFound: 404 page for invalid routes in Doggerz.
 * - Clear error message
 * - Simple way back to safety
 */
export default function NotFound() {
  const nav = useNavigate();

  return (
    <PageContainer
      title="Page not found"
      subtitle="The route you tried doesn’t exist."
      metaDescription="Doggerz 404 page: route not found. Navigate back to home or previous screen."
      padding="px-6 py-16"
    >
      {/* Main 404 message section */}
      <section
        className="text-center space-y-4"
        aria-labelledby="notfound-title"
      >
        <h2
          id="notfound-title"
          className="text-5xl font-extrabold text-emerald-400 tracking-tight"
        >
          404
        </h2>

        <p className="text-sm text-zinc-200">
          That path doesn&apos;t exist in Doggerz. Your pup wandered off the
          map.
        </p>

        {/* Navigation options */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => nav(PATHS.HOME)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400
                       text-black font-semibold transition-colors"
          >
            Back to home
          </button>

          <button
            type="button"
            onClick={() => nav(-1)}
            className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-100
                       hover:bg-zinc-800 font-semibold transition-colors"
          >
            Go back
          </button>
        </div>
      </section>
    </PageContainer>
  );
}
